import { XMLtoJSON, Updater, LocalServer, Http, Log, LogLevel, Storage } from './services';
import { IAccountInfo, IAccount, ICharacterInfo, SERVER_ENDPOINT, IServer, environment } from './models';
import { PluginManager, ResourceManager, Client } from './core';
import fs = require('fs');
import net = require('net');
import dns = require('dns');
import { StringUtils } from './services/string-utils';

const args = process.argv;
const ACCOUNT_IN_USE_REGEX = /Account in use \((\d+) seconds? until timeout\)/;

export class CLI {

    public static addClient(account: IAccount, charInfo?: ICharacterInfo): Promise<any> {
        return new Promise((resolve: (client: Client) => void, reject: (err: Error) => void) => {
            if (!account.alias) {
                account.alias = StringUtils.censorGuid(account.guid);
            }
            if (this.clients[account.guid]) {
                const err = new Error(account.alias + ' has already been added.');
                reject(err);
                return;
            }
            const handler = (info: IAccount) => {
                let server: IServer;
                if (net.isIP(account.serverPref) !== 0) {
                    server = {
                        name: account.serverPref,
                        address: account.serverPref
                    };
                }
                if (!server) {
                    let keys: string[];
                    try {
                        keys = Object.keys(this.internalServerList);
                    } catch (err) {
                        keys = [];
                    }
                    if (keys.length > 0) {
                        if (!account.serverPref || account.serverPref === '') {
                            Log('NRelay', 'Preferred server not found. Choosing first server.', LogLevel.Warning);
                            server = this.internalServerList[keys[0]];
                        }
                        server = this.internalServerList[account.serverPref];
                    } else {
                        reject(new Error(account.alias + ' couldn\'t get servers.'));
                        return;
                    }
                }
                const client = new Client(server, this.buildVersion, account);
                this.clients[account.guid] = client;
                resolve(client);
            };
            Log('NRelay', `Adding ${account.alias}`, LogLevel.Info);
            if (charInfo || account.charInfo) {
                if (environment.debug) {
                    Log('NRelay', `Using provided character info for ${account.alias}.`, LogLevel.Info);
                }
                if (charInfo) {
                    account.charInfo = charInfo;
                }
                handler(account);
            } else {
                this.getAccountInfo(account).then(handler).catch((error) => {
                    const accError = this.handleAccountInfoError(error, account);
                    if (accError) {
                        reject(accError);
                    } else {
                        reject(error);
                    }
                });
            }
        });
    }

    public static removeClient(guid: string): boolean {
        if (this.clients[guid]) {
            this.clients[guid].destroy();
            delete this.clients[guid];
            Log('NRelay', `Removed ${StringUtils.censorGuid(guid)}`, LogLevel.Info);
            return true;
        }
        return false;
    }

    public static getClient(guid: string): Client {
        if (!this.clients.hasOwnProperty(guid)) {
            return null;
        }
        return this.clients[guid];
    }

    public static getClients(): Client[] {
        if (!this.clients) {
            return new Array<Client>(0);
        }
        return Object.keys(this.clients).map((k) => this.clients[k]);
    }

    public static loadServers(): Promise<any> {
        Log('NRelay', 'Loading server list', LogLevel.Info);
        return new Promise((resolve: () => void, reject: (err: Error) => void) => {
            Http.get(SERVER_ENDPOINT).then((data: any) => {
                Log('NRelay', 'Server list loaded.', LogLevel.Success);
                this.internalServerList = XMLtoJSON.parseServers(data);
                resolve();
            }).catch((err) => {
                Log('NRelay', `Error loading server list: ${err.message}`);
                reject(err);
            });
        });
    }

    public static get serverList(): { [id: string]: IServer } {
        return this.internalServerList;
    }

    private static clients: {
        [guid: string]: Client
    };

    private static internalServerList: { [id: string]: IServer };
    private static buildVersion: string;

    private static getAccountInfo(account: IAccount): Promise<IAccount> {
        return new Promise((resolve: (acc: IAccount) => void, reject: (err: Error | string) => void) => {
            const handler = (data: string) => {
                const info = XMLtoJSON.parseAccountInfo(data);
                this.internalServerList = XMLtoJSON.parseServers(data);
                if (info) {
                    account.charInfo = info;
                    resolve(account);
                } else {
                    reject(data);
                }
            };
            if (account.proxy) {
                if (net.isIP(account.proxy.host) === 0) {
                    Log('NRelay', 'Resolving proxy hostname.', LogLevel.Info);
                    dns.lookup(account.proxy.host, (err, address, family) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        Log('NRelay', 'Proxy hostname resolved!', LogLevel.Success);
                        account.proxy.host = address;
                        Http.proxiedGet(SERVER_ENDPOINT, account.proxy, {
                            guid: account.guid,
                            password: account.password
                        }).then(handler, reject);
                    });
                } else {
                    Http.proxiedGet(SERVER_ENDPOINT, account.proxy, {
                        guid: account.guid,
                        password: account.password
                    }).then(handler, reject);
                }
            } else {
                Http.get(SERVER_ENDPOINT, {
                    guid: account.guid,
                    password: account.password
                }).then(handler, reject);
            }
        });
    }

    private static proceed(): void {
        const accInfo = Storage.getAccountConfig();
        if (accInfo instanceof Error) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', LogLevel.Error);
            Log('NRelay', accInfo.message, LogLevel.Warning);
            return;
        }
        this.buildVersion = accInfo.buildVersion;
        if (accInfo.localServer) {
            if (accInfo.localServer.enabled) {
                LocalServer.init(accInfo.localServer.port);
            }
        }

        const loadResources = new Promise((resolve: () => void, reject: () => void) => {
            Promise.all([ResourceManager.loadTileInfo(), ResourceManager.loadObjects()]).then(() => {
                resolve();
            }).catch((error) => {
                Log('NRelay', 'An error occurred while loading tiles and objects.', LogLevel.Warning);
                resolve();
            });
        });
        loadResources.then(() => {
            PluginManager.loadPlugins();
        });

        for (let i = 0; i < accInfo.accounts.length; i++) {
            const acc = accInfo.accounts[i];
            setTimeout(() => {
                this.addClient(acc).then(() => {
                    Log('NRelay', `Authorized ${acc.alias}`, LogLevel.Success);
                }).catch((error: Error) => {
                    Log('NRelay', `${acc.alias}: ${error.message}`, LogLevel.Error);
                });
            }, (i * 1000));
        }
    }

    private static handleAccountInfoError(response: string, acc: IAccount): Error {
        if (!response) {
            return new Error('Empty response');
        }
        const accInUse = ACCOUNT_IN_USE_REGEX.exec(response);
        if (accInUse) {
            const time = +accInUse[1] + 1;
            setTimeout(() => {
                this.addClient(acc);
            }, time * 1000);
            return new Error(`Account in use error. Reconnecting in ${time} seconds.`);
        } else {
            const error = XMLtoJSON.parseError(response);
            return error;
        }
    }

    constructor() {
        this.updateEnvironment();
        CLI.clients = {};
        if (environment.log) {
            Storage.createLog();
        }
        if (environment.debug) {
            Log('NRelay', 'Starting in debug mode...');
        } else {
            Log('NRelay', 'Starting...');
        }
        if (this.hasFlag('--no-update')) {
            Log('NRelay', 'Not checking for updates.', LogLevel.Info);
            CLI.proceed();
        } else {
            const forceUpdate = this.hasFlag('--force-update');
            const update = (force: boolean = false) => {
                Updater.getLatest(force).then(() => {
                    process.exit(0);
                }).catch((error: Error) => {
                    Log('NRelay', `Error while updating: ${error.message}`, LogLevel.Error);
                });
            };
            if (forceUpdate) {
                Log('NRelay', 'Forcing an update...', LogLevel.Info);
                update(true);
            } else {
                Log('NRelay', 'Checking for updates...', LogLevel.Info);
                Updater.checkVersion().then((needsUpdate) => {
                    if (needsUpdate) {
                        Log('NRelay', 'An update is available. Downloading...');
                        update();
                    } else {
                        CLI.proceed();
                    }
                }).catch(() => {
                    Log('NRelay', 'Error while checking for update, starting anyway.', LogLevel.Info);
                    CLI.proceed();
                });
            }
        }
    }

    private updateEnvironment(): void {
        if (this.hasFlag('--no-log')) {
            environment.log = false;
        }
        if (this.hasFlag('--debug')) {
            environment.debug = true;
        }
    }

    private hasFlag(flag: string): boolean {
        for (let i = 0; i < args.length; i++) {
            if (args[i] === flag) {
                return true;
            }
        }
        return false;
    }
}
