import { XMLtoJSON, Updater, LocalServer, Log, LogLevel, Storage, AccountService, StringUtils } from './services';
import { IAccountInfo, IAccount, ICharacterInfo, IServer, environment } from './models';
import { PluginManager, ResourceManager, Client } from './core';
import * as net from 'net';
import * as argParser from './services/arg-parser';

export class CLI {
    /**
     * Creates a new client with the `account` details provided.
     *
     * The `charInfo` can optionally be provided to avoid the initial web
     * request to fetch the character info.
     * @param account The account info to use.
     * @param charInfo The character info to use.
     */
    static addClient(account: IAccount, charInfo?: ICharacterInfo): Promise<Client> {
        if (!account.alias) {
            account.alias = StringUtils.censorGuid(account.guid);
        }
        if (this.clients[account.guid]) {
            const err = new Error(`${account.alias} has already been added.`);
            return Promise.reject(err);
        }
        Log('NRelay', `Loading ${account.alias}`);
        return AccountService.resolveProxyHostname(account.proxy).then(() => {
            if (charInfo) {
                return charInfo;
            }
            if (account.charInfo) {
                return account.charInfo;
            }
            return AccountService.getCharacterInfo(account.guid, account.password, account.proxy);
        }).then((retrievedCharInfo) => {
            account.charInfo = retrievedCharInfo;
            return AccountService.getServerList();
        }).then((servers: { [name: string]: IServer }) => {
            let server: IServer;
            if (net.isIP(account.serverPref) !== 0) {
                server = {
                    name: account.serverPref,
                    address: account.serverPref
                };
            }
            if (!server) {
                if (!servers[account.serverPref]) {
                    const keys = Object.keys(servers);
                    if (keys.length === 0) {
                        throw new Error(`Server list is empty.`);
                    }
                    server = servers[keys[Math.floor(Math.random() * keys.length)]];
                    Log('NRelay', `Preferred server not found. Using ${server.name} instead.`, LogLevel.Warning);
                } else {
                    server = servers[account.serverPref];
                }
            }
            Log('NRelay', `Loaded ${account.alias}!`, LogLevel.Success);
            const client = new Client(server, this.buildVersion, account);
            this.clients[account.guid] = client;
            return client;
        });
    }

    /**
     * Removes all clients which return true for the `predicate`.
     * @param predicate The predicate used to test clients.
     */
    static removeAny(predicate: (client: Client) => boolean): number {
        const keysToRemove = Object.keys(this.clients)
            .filter((k) => predicate(this.clients[k]));
        for (const key of keysToRemove) {
            const guid = this.clients[key].guid;
            this.clients[key].destroy();
            delete this.clients[key];
            Log('NRelay', `Removed ${guid}`, LogLevel.Info);
        }
        return keysToRemove.length;
    }

    /**
     * Returns all clients which return true for the `predicate`.
     * @param predicate The predicate used to test clients.
     */
    static getAny(predicate: (client: Client) => boolean): Client[] {
        return Object.keys(this.clients)
            .map((k) => this.clients[k])
            .filter((client) => predicate(client));
    }

    /**
     * Returns all clients.
     */
    static getClients(): Client[] {
        if (!this.clients) {
            return new Array<Client>(0);
        }
        return Object.keys(this.clients).map((k) => this.clients[k]);
    }

    private static clients: {
        [guid: string]: Client
    };

    private static buildVersion: string;

    private static proceed(): void {
        let accInfo: IAccountInfo;
        try {
            accInfo = Storage.getAccountConfig();
        } catch (error) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', LogLevel.Error);
            Log('NRelay', error.message, LogLevel.Warning);
            return;
        }
        this.buildVersion = accInfo.buildVersion;
        if (accInfo.localServer) {
            if (accInfo.localServer.enabled) {
                LocalServer.init(accInfo.localServer.port);
            }
        }

        ResourceManager.loadAllResources().then(() => {
            if (environment.loadPlugins) {
                PluginManager.loadPlugins();
            } else {
                Log('NRelay', 'Load plugins disabled. No plugins will be loaded.', LogLevel.Warning);
            }
            for (let i = 0; i < accInfo.accounts.length; i++) {
                const acc = accInfo.accounts[i];
                setTimeout(() => {
                    this.addClient(acc).catch((err) => this.handleAddAccountError(acc, err));
                }, (i * 1000));
            }
        }).catch((error) => {
            Log('NRelay', 'An error occurred while loading the resources required to run nrelay.', LogLevel.Error);
            Log('NRelay', error.message, LogLevel.Error);
            Log('NRelay', 'If this error persists, trying redownloading the resources by running "nrelay --force-update"');
        });
    }

    private static handleAddAccountError(acc: IAccount, error: Error): void {
        if (error.name) {
            switch (error.name) {
                case 'ACCOUNT_IN_USE':
                    const timeout: number = (error as any).timeout__;
                    Log(acc.alias, `Account in use. (${timeout} second${timeout !== 1 ? 's' : ''})`, LogLevel.Warning);
                    const shortTimeout = Math.floor(timeout / 4) + 1;
                    Log(acc.alias, `Reconnecting in ${shortTimeout} second${shortTimeout !== 1 ? 's' : ''}`);
                    setTimeout(() => {
                        this.addClient(acc).catch((err) => this.handleAddAccountError(acc, err));
                    }, shortTimeout * 1000);
                    break;
                default:
                    Log(acc.alias, error.message, LogLevel.Error);
                    break;
            }
        }
    }

    constructor() {
        const args = argParser.parse(process.argv.slice(2));
        this.updateEnvironment(args);
        CLI.clients = {};
        if (environment.log) {
            Storage.createLog();
        }
        if (environment.debug) {
            Log('NRelay', 'Starting in debug mode...');
        } else {
            Log('NRelay', 'Starting...');
        }
        if (args.update === false) {
            Log('NRelay', 'Not checking for updates.', LogLevel.Info);
            CLI.proceed();
        } else if (args.hasOwnProperty('update-from')) {
            const path = args['update-from'];
            Log('NRelay', 'Updating from custom path.', LogLevel.Info);
            Updater.updateFrom(path).then(() => {
                return Updater.rebuildSource();
            }).then(() => {
                process.exit(0);
            });
        } else if (args['force-update'] === true) {
            Log('NRelay', 'Forcing an update...', LogLevel.Info);
            Updater.getLatest().then(() => {
                process.exit(0);
            }).catch((error) => {
                Log('NRelay', `Error while updating: ${error.message}`, LogLevel.Error);
            });
        } else {
            Log('NRelay', 'Checking for updates...', LogLevel.Info);
            Updater.isOutdated(Updater.getCurrentVersion()).then((needsUpdate) => {
                if (needsUpdate) {
                    Log('NRelay', 'An update is available. Downloading...');
                    return Updater.getLatest().then(() => {
                        process.exit();
                    });
                } else {
                    CLI.proceed();
                }
            }).catch(() => {
                Log('NRelay', 'Error while checking for update, starting anyway.', LogLevel.Info);
                CLI.proceed();
            });
        }
    }

    private updateEnvironment(args: argParser.IArgsResult): void {
        if (args.log === false) {
            environment.log = false;
        }
        if (args.debug === true) {
            environment.debug = true;
        }
        if (args.plugins === false) {
            environment.loadPlugins = false;
        }
    }
}
