import { Log, LogLevel, Logger } from './services/logger';
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

    private serverList: { [id: string]: IServer };

    constructor() {
        this.checkFlags();
        if (environment.log) {
            const logStream = fs.createWriteStream(Storage.makePath('nrelay-log.log'));
            logStream.write('Log Start (time: ' + Date.now() + ')\n');
            Logger.logStream = logStream;
        }
        if (environment.debug) {
            Log('NRelay', 'Starting in debug mode...');
        } else {
            Log('NRelay', 'Starting...');
        }
        if (this.hasFlag('--no-update')) {
            Log('NRelay', 'Not checking for updates.', LogLevel.Info);
            this.proceed();
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
                    this.proceed();
                }
            }).catch(() => {
                Log('NRelay', 'Error while checking for update, starting anyway.', LogLevel.Info);
                this.proceed();
            });
        }
    }

    proceed(): void {
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

        for (let i = 0; i < accInfo.accounts.length; i++) {
            const acc = accInfo.accounts[i];
            setTimeout(() => {
                this.getAccountInfo(acc).then((info) => {
                    const keys = Object.keys(this.serverList);
                    if (keys.length > 0) {
                        let server: IServer;
                        if (!this.serverList[acc.serverPref]) {
                            Log('NRelay', 'Preferred server not found. Choosing first server.', LogLevel.Warning);
                            server = this.serverList[keys[0]];
                        } else {
                            server = this.serverList[acc.serverPref];
                        }
                        const client = new Client(server, accInfo.buildVersion, info);
                    } else {
                        Log('NRelay', 'Couldn\'t get servers.', LogLevel.Error);
                    }
                }).catch((err) => {
                    // error already handled.
                });
            }, (i * 1000));
        }
    }

    getAccountInfo(account: IAccount): Promise<IAccount> {
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
        return new Promise((resolve, reject) => {
            Http.get(SERVER_ENDPOINT, {
                guid: account.guid,
                password: account.password
            }).then((data) => {
                const info = parseAccountInfo(data);
                this.serverList = parseServers(data);
                if (info) {
                    account.charInfo = info;
                    Log(account.alias, 'Authorized account', LogLevel.Success);
                    resolve(account);
                } else {
                    Log(account.alias, 'Error: ' + parseError(data), LogLevel.Warning);
                    reject();
                }
            }).catch((err) => reject(err));
        });
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
