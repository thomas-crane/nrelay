import { Log, LogLevel } from './services/logger';
import { Http } from './services/http';
import { parseServers, parseAccountInfo, parseError } from './services/xmltojson';
import { SERVER_ENDPOINT } from './models/api-endpoints';
import { IServer } from './models/server';
import { IAccountInfo, IAccount, ICharacterInfo } from './models/accinfo';
import { Client } from './core/client';
import { Storage } from './services/storage';
import { PluginManager } from './core/plugin-manager';
import { ResourceManager } from './core/resource-manager';
import { Updater } from './services/updater';
import { environment } from './models/environment';
import fs = require('fs');
import net = require('net');
import dns = require('dns');
import { LocalServer } from './services/local-server';

const args = process.argv;
const EMAIL_REPLACE_REGEX = /.+?(.+?)(?:@|\+\d+).+?(.+?)\./;
const ACCOUNT_IN_USE_REGEX = /Account in use \((\d+) seconds? until timeout\)/;
const LOCAL_SERVER_DEFAULT_PORT = 5680;

export class CLI {

    public static addClient(account: IAccount, charInfo?: ICharacterInfo): Promise<any> {
        return new Promise((resolve: (client: Client) => void, reject: (err: Error) => void) => {
            if (!account.alias) {
                const match = EMAIL_REPLACE_REGEX.exec(account.guid);
                if (match) {
                    if (match[1]) {
                        account.alias = account.guid.replace(match[1], '***');
                    }
                    if (match[2]) {
                        account.alias = account.alias.replace(match[2], '***');
                    }
                }
            }
            if (this.clients[account.alias]) {
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
                this.clients[account.alias] = client;
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
                    this.handleConnectionError(error, account);
                    reject(error);
                });
            }
        });
    }

    public static removeClient(alias: string): boolean {
        if (this.clients[alias]) {
            this.clients[alias].destroy();
            delete this.clients[alias];
            Log('NRelay', `Removed ${alias}`, LogLevel.Info);
            return true;
        }
        return false;
    }

    public static getClient(alias: string): Client | null {
        if (!this.clients.hasOwnProperty(alias)) {
            return null;
        }
        return this.clients[alias];
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
                this.internalServerList = parseServers(data);
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
        return new Promise((resolve: (acc: IAccount) => void, reject: (err: Error) => void) => {
            const handler = (data: any) => {
                const info = parseAccountInfo(data);
                this.internalServerList = parseServers(data);
                if (info) {
                    account.charInfo = info;
                    resolve(account);
                } else {
                    reject(parseError(data));
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
                        }).then(handler).catch((error) => reject(error));
                    });
                } else {
                    Http.proxiedGet(SERVER_ENDPOINT, account.proxy, {
                        guid: account.guid,
                        password: account.password
                    }).then(handler).catch((err) => reject(err));
                }
            } else {
                Http.get(SERVER_ENDPOINT, {
                    guid: account.guid,
                    password: account.password
                }).then(handler).catch((err) => reject(err));
            }
        });
    }

    private static proceed(): void {
        const accInfo = Storage.getAccountConfig();
        if (!accInfo) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', LogLevel.Error);
            return;
        }
        this.buildVersion = accInfo.buildVersion;
        if (accInfo.localServer) {
            if (accInfo.localServer.enabled) {
                LocalServer.init(accInfo.localServer.port || LOCAL_SERVER_DEFAULT_PORT);
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
                    Log('NRelay', error.message, LogLevel.Error);
                });
            }, (i * 1000));
        }
    }

    private static handleConnectionError(error: string, acc: IAccount): void {
        if (!error) {
            return;
        }
        const accInUse = ACCOUNT_IN_USE_REGEX.exec(error);
        if (accInUse) {
            const time = +accInUse[1] + 1;
            Log('NRelay', `${acc.alias} Received account in use error. Reconnecting in ${time} seconds.`, LogLevel.Warning);
            setTimeout(() => {
                this.addClient(acc);
            }, time * 1000);
            return;
        }
    }

    constructor() {
        this.checkFlags();
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
            Log('NRelay', 'Checking for updates...', LogLevel.Info);
            Updater.checkVersion().then((needsUpdate) => {
                if (needsUpdate) {
                    Log('NRelay', 'An update is available. Downloading...');
                    Updater.getLatest().then(() => {
                        process.exit(0);
                    }).catch((error) => {
                        Log('NRelay', `Error while updating: ${JSON.stringify(error)}`, LogLevel.Error);
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

    private checkFlags(): void {
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
