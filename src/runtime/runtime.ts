import { PacketMap } from '@realmlib/net';
import { createWriteStream, WriteStream } from 'fs';
import { Arguments } from 'yargs';
import { Client, LibraryManager, ResourceManager } from '../core';
import { Account, Server } from '../models';
import { AccountService, DefaultLogger, FileLogger, Logger, LogLevel, StringUtils, Updater } from '../services';
import { Environment } from './environment';
import { Versions } from './versions';

/**
 * The runtime manages clients, resources, plugins and any other services
 * which are used by an nrelay project.
 */
export class Runtime {

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
   * The clients which are managed by this runtime.
   */
  readonly clients: Map<string, Client>;
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
   * A WriteStream which is used for the log file.
   */
  private logStream: WriteStream;

  constructor(environment: Environment) {
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

    // set up the logging.
    let minLevel = LogLevel.Info;
    if (args.debug) {
      minLevel = LogLevel.Debug;
    }
    Logger.addLogger(new DefaultLogger(minLevel));

    // set up the log file if we have the flag enabled.
    if (args.log) {
      this.createLog();
      Logger.addLogger(new FileLogger(this.logStream));
    }

    // force an update.
    if (args['force-update']) {
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

    // load the plugins. The default is to load plugins from `lib/`, but we can change that with an arg.
    let pluginFolder = 'lib';
    if (args.pluginPath && typeof args.pluginPath === 'string') {
      pluginFolder = args.pluginPath;
    }
    this.libraryManager.loadPlugins(pluginFolder);

    // finally, load any accounts.
    const accounts = this.env.readJSON<Account[]>('accounts.json');
    if (accounts) {
      for (const account of accounts) {
        this.addClient(account).catch((err) => {
          Logger.log('Runtime', `Error adding account "${account.alias}": ${err.message}`, LogLevel.Error);
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
      account.alias = StringUtils.censorGuid(account.guid);
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
        const keys = Object.keys(servers);
        if (keys.length === 0) {
          throw new Error('Server list is empty.');
        }
        server = servers[keys[Math.floor(Math.random() * keys.length)]];
        Logger.log(account.alias, `Preferred server not found. Using ${server.name} instead.`, LogLevel.Warning);
      }
      Logger.log('Runtime', `Loaded ${account.alias}!`, LogLevel.Success);
      const client = new Client(this, server, account);
      this.clients.set(client.guid, client);
      return client;
    });
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
