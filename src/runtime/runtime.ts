import { PacketMap } from '@realmlib/net';
import { EventEmitter } from 'events';
import { createWriteStream, WriteStream } from 'fs';
import { isIP } from 'net';
import { Client, LibraryManager, ResourceManager } from '../core';
import { Account, Server } from '../models';
import { ACCOUNT_IN_USE, AccountInUseError } from '../models/account-in-use-error';
import { AccountService, censorGuid, DefaultLogger, FileLogger, Logger, LogLevel, Updater } from '../services';
import { delay } from '../util/misc-util';
import { Environment } from './environment';
import { Versions } from './versions';

/**
 * An object which can be provided to the runtime when running.
 */
interface Arguments {
  [argName: string]: unknown;
}

/**
 * An account which was initially added, but failed for some reason.
 */
interface FailedAccount {
  /**
   * The account which failed to load.
   */
  account: Account;
  /**
   * The number of times this account has tried to be loaded.
   */
  retryCount: number;
  /**
   * The number of seconds to wait before trying to load this account again.
   */
  timeout: number;
}

/**
 * The runtime manages clients, resources, plugins and any other services
 * which are used by an nrelay project.
 */
export class Runtime extends EventEmitter {

  /**
   * The environment of this runtime.
   */
  readonly env: Environment;

  /**
   * The updater used by this runtime.
   */
  readonly updater: Updater;
  /**
   * The account service used by this runtime.
   */
  readonly accountService: AccountService;
  /**
   * The resource manager used by this runtime.
   */
  readonly resources: ResourceManager;
  /**
   * The library manager used by this runtime.
   */
  readonly libraryManager: LibraryManager;
  /**
   * A bidirectional map of packet ids.
   */
  packetMap: PacketMap;
  /**
   * The build version to use when creating new clients.
   */
  buildVersion: string;
  /**
   * The last arguments which were passed to this runtime.
   *
   * Note that this may be `undefined`, and it may also contain arguments which
   * were not passed by the user (such as the `update` and `plugin-path` args).
   */
  args: Arguments;

  /**
   * A WriteStream which is used for the log file.
   */
  private logStream: WriteStream;
  /**
   * The clients which are managed by this runtime.
   */
  private readonly clients: Map<string, Client>;

  constructor(environment: Environment) {
    super();
    this.env = environment;
    this.updater = new Updater(this.env);
    this.accountService = new AccountService(this.env);
    this.resources = new ResourceManager(this.env);
    this.libraryManager = new LibraryManager(this);
    this.clients = new Map();
  }

  /**
   * Starts this runtime.
   * @param args The arguments to start the runtime with.
   */
  async run(args: Arguments): Promise<void> {
    this.args = args;

    // set up the logging.
    let minLevel = LogLevel.Info;
    if (args.debug) {
      minLevel = LogLevel.Debug;
    }
    Logger.addLogger(new DefaultLogger(minLevel));

    // set up the log file if we have the flag enabled.
    if (args.log) {
      Logger.log('Runtime', 'Creating a log file.', LogLevel.Info);
      this.createLog();
      Logger.addLogger(new FileLogger(this.logStream));
    }

    // force an update.
    if (args['force-update'] === true) {
      try {
        await this.updater.performUpdate({ needAssetUpdate: true, needClientUpdate: true });
        Logger.log('Runtime', 'Finished updating!', LogLevel.Success);
      } catch (err) {
        Logger.log('Runtime', `Error while updating: ${err.message}`, LogLevel.Error);
      }
    } else {
      // just check for updates normally (as long as --no-update wasn't included).
      if (args.update !== false) {
        try {
          Logger.log('Runtime', 'Checking for updates...', LogLevel.Info);
          const updateInfo = await this.updater.checkForUpdates();
          await this.updater.performUpdate(updateInfo);
        } catch (err) {
          Logger.log('Runtime', `Error while updating: ${err.message}`, LogLevel.Error);
        }
      }
    }

    // load the resources.
    try {
      this.resources.loadAllResources();
    } catch (error) {
      Logger.log('Runtime', 'Error while loading resources.', LogLevel.Error);
      Logger.log('Runtime', error.message, LogLevel.Error);
      process.exit(0);
    }

    // load the packets
    const packets: PacketMap = this.env.readJSON('packets.json');
    if (!packets) {
      Logger.log('Runtime', 'Cannot load packets.json', LogLevel.Error);
      process.exit(0);
    } else {
      this.packetMap = packets;
      // the length is divided by 2 because the map is bidirectional.
      const size = Object.keys(this.packetMap).length / 2;
      Logger.log('Runtime', `Mapped ${size} packet ids.`, LogLevel.Info);
    }

    // load the buildVersion.
    const versions = this.env.readJSON<Versions>('versions.json');
    if (versions && versions.buildVersion) {
      this.buildVersion = versions.buildVersion;
      Logger.log('Runtime', `Using build version "${this.buildVersion}"`, LogLevel.Info);
    } else {
      Logger.log('Runtime', 'Cannot load buildVersion. It will be loaded when a client connects.', LogLevel.Warning);
    }

    // load the client hooks.
    this.libraryManager.loadClientHooks();

    // if plugin loading is enabled.
    if (args.plugins !== false) {
      // load the plugins. The default is to load plugins from `lib/`, but we can change that with an arg.
      let pluginFolder = 'lib';
      if (args.pluginPath && typeof args.pluginPath === 'string') {
        pluginFolder = args.pluginPath;
        Logger.log('Runtime', `Loading plugins from "${pluginFolder}"`, LogLevel.Debug);
      }
      this.libraryManager.loadPlugins(pluginFolder);
    } else {
      Logger.log('Runtime', 'Plugin loading disabled.', LogLevel.Info);
    }

    // finally, load any accounts.
    const accounts = this.env.readJSON<Account[]>('accounts.json');
    if (accounts) {
      const failures: FailedAccount[] = [];
      for (const account of accounts) {
        try {
          await this.addClient(account);
        } catch (err) {
          Logger.log('Runtime', `Error adding account "${account.alias}": ${err.message}`, LogLevel.Error);
          const failure = {
            account,
            retryCount: 1,
            timeout: 1,
          };
          if (err.name === ACCOUNT_IN_USE) {
            failure.timeout = (err as AccountInUseError).timeout;
          }
          failures.push(failure);
        }
      }
      // try to load the failed accounts.
      for (const failure of failures) {
        // perform the work in a promise so it doesn't block.
        new Promise(async (resolve, reject) => {
          while (failure.retryCount <= 10) {
            Logger.log(
              'Runtime',
              `Retrying "${failure.account.alias}" in ${failure.timeout} seconds. (${failure.retryCount}/10)`,
              LogLevel.Info,
            );
            // wait for the timeout then try to add the client.
            await delay(failure.timeout * 1000);
            try {
              await this.addClient(failure.account);
              resolve();
            } catch (err) {
              // if it failed, increase the timeout on a logarithmic scale.
              Logger.log('Runtime', `Error adding account "${failure.account.alias}": ${err.message}`, LogLevel.Error);
              if (err.name === ACCOUNT_IN_USE) {
                failure.timeout = (err as AccountInUseError).timeout;
              } else {
                failure.timeout = Math.floor(Math.log10(1 + failure.retryCount) / 2 * 100);
              }
              failure.retryCount++;
            }
          }
          reject();
        }).catch(() => {
          Logger.log(
            'Runtime',
            `Failed to load "${failure.account.alias}" after 10 retries. Not retrying.`,
            LogLevel.Error,
          );
        });
      }
    }
  }

  /**
   * Creates a new client which uses the provided account.
   * @param account The account to login to.
   */
  addClient(account: Account): Promise<Client> {
    // make sure the client has an alias.
    if (!account.alias) {
      account.alias = censorGuid(account.guid);
    }

    // make sure it's not already part of this runtime.
    if (this.clients.has(account.guid)) {
      return Promise.reject(new Error(`This account is already managed by this runtime.`));
    }

    Logger.log('Runtime', `Loading ${account.alias}...`);

    // get the server list and char info.
    return Promise.all([
      this.accountService.getServerList(),
      this.accountService.getCharacterInfo(account.guid, account.password, account.proxy),
    ]).then(([servers, charInfo]) => {
      account.charInfo = charInfo;

      // make sure the server exists.
      let server: Server;
      if (servers[account.serverPref]) {
        server = servers[account.serverPref];
      } else {
        if (isIP(account.serverPref) !== 0) {
          server = {
            address: account.serverPref,
            name: `IP: ${account.serverPref}`,
          };
        } else {
          const keys = Object.keys(servers);
          if (keys.length === 0) {
            throw new Error('Server list is empty.');
          }
          server = servers[keys[Math.floor(Math.random() * keys.length)]];
          Logger.log(account.alias, `Preferred server not found. Using ${server.name} instead.`, LogLevel.Warning);
        }
      }
      Logger.log('Runtime', `Loaded ${account.alias}!`, LogLevel.Success);
      const client = new Client(this, server, account);
      this.clients.set(client.guid, client);
      return client;
    });
  }

  /**
   * Removes the client with the given `guid` from this runtime.
   * @param guid The guid of the client to remove.
   */
  removeClient(guid: string): void {
    // make sure the client is actually in this runtime.
    if (this.clients.has(guid)) {
      const alias = this.clients.get(guid).alias;
      this.clients.get(guid).destroy();
      this.clients.delete(guid);
      Logger.log('Runtime', `Removed ${alias}!`, LogLevel.Success);
    } else {
      Logger.log(
        'Runtime',
        `The client ${censorGuid(guid)} is not part of this runtime.`,
        LogLevel.Warning,
      );
    }
  }

  /**
   * Gets a copy of the clients in this runtime.
   * Modifying this list will not affect the runtime.
   */
  getClients(): Client[] {
    return [...this.clients.values()];
  }

  /**
   * Updates the build version stored in the versions.json file.
   * @param buildVersion The new build version to store.
   */
  updateBuildVersion(buildVersion: string): void {
    this.env.updateJSON<Versions>({ buildVersion } as Versions, 'versions.json');
  }

  /**
   * Creates a log file for this runtime.
   */
  private createLog(): void {
    const nrelayVersion = require('../../package.json').version;
    this.logStream = createWriteStream(this.env.pathTo('nrelay-log.log'));
    const watermark = [
      'INFO',
      '----',
      `date           :: ${(new Date()).toString()}`,
      `nrelay version :: v${nrelayVersion}`,
      `node version   :: ${process.version}`,
      '',
      'LOG',
      '----',
    ].join('\n');
    this.logStream.write(`${watermark}\n`);
  }
}
