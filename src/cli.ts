import { Log, LogLevel } from './services/logger';
import { Http } from './services/http';
import { parseServers, parseAccountInfo, parseError } from './services/xmltojson';
import { SERVER_ENDPOINT } from './models/api-endpoints';
import { IServer } from './models/server';
import { IAccountInfo, IAccount } from './models/accinfo';
import { Client } from './core/client';
import { Storage } from './services/storage';
import { PluginManager } from './core/plugin-manager';
import { ResourceManager } from './core/resource-manager';
import { Updater } from './services/updater';
import { environment } from './models/environment';
import fs = require('fs');

const args = process.argv;
const EMAIL_REPLACE_REGEX = /.+?(.+?)(?:@|\+\d+).+?(.+?)\./;

export class CLI {

    public static addClient(account: IAccount): Promise<any> {
        return new Promise((resolve, reject) => {
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
            Log('NRelay', 'Adding ' + account.alias, LogLevel.Info);
            this.getAccountInfo(account).then((info) => {
                const keys = Object.keys(this.serverList);
                if (keys.length > 0) {
                    let server = this.serverList[account.serverPref];
                    if (!server) {
                        Log('NRelay', 'Preferred server not found. Choosing first server.', LogLevel.Warning);
                        server = this.serverList[keys[0]];
                    }
                    const client = new Client(server, this.buildVersion, account);
                    this.clients[account.alias] = client;
                    resolve(client);
                } else {
                    reject(new Error(account.alias + ' couldn\'t get servers.'));
                }
            }).catch((error) => {
                const err = new Error(account.alias + ': ' + error);
                reject(err);
            });
        });
    }

    public static removeClient(alias: string): boolean {
        if (this.clients[alias]) {
            this.clients[alias].destroy();
            delete this.clients[alias];
            Log('NRelay', 'Removed ' + alias, LogLevel.Info);
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

    private static clients: {
        [guid: string]: Client
    };

    private static serverList: { [id: string]: IServer };
    private static buildVersion: string;

    private static getAccountInfo(account: IAccount): Promise<IAccount> {
        return new Promise((resolve, reject) => {
            const handler = (data: any) => {
                const info = parseAccountInfo(data);
                this.serverList = parseServers(data);
                if (info) {
                    account.charInfo = info;
                    resolve(account);
                } else {
                    reject(parseError(data));
                }
            };
            if (account.proxy) {
                Http.proxiedGet(SERVER_ENDPOINT, account.proxy, {
                    guid: account.guid,
                    password: account.password
                }).then(handler).catch((err) => reject(err));
            } else {
                Http.get(SERVER_ENDPOINT, {
                    guid: account.guid,
                    password: account.password
                }).then(handler).catch((err) => reject(err));
            }
        });
    }

    private static proceed(): void {
        Promise.all([ResourceManager.loadTileInfo(), ResourceManager.loadObjects()]).then(() => {
            PluginManager.loadPlugins();
        }).catch((error) => {
            Log('NRelay', 'An error occurred while loading tiles and objects.', LogLevel.Warning);
            PluginManager.loadPlugins();
        });
        const accInfo = Storage.getAccountConfig();
        if (!accInfo) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', LogLevel.Error);
            return;
        }

        this.buildVersion = accInfo.buildVersion;

        for (let i = 0; i < accInfo.accounts.length; i++) {
            const acc = accInfo.accounts[i];
            setTimeout(() => {
                this.addClient(acc).then(() => {
                    Log('NRelay', 'Authorized ' + acc.alias, LogLevel.Success);
                }).catch((error) => {
                    Log('NRelay', error, LogLevel.Error);
                });
            }, (i * 1000));
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
                        Log('NRelay', 'Error while updating: ' + JSON.stringify(error), LogLevel.Error);
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
