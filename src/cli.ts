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

const args = process.argv;

export class CLI {

    private serverList: { [id: string]: IServer };

    constructor() {
        if (this.hasFlag('--debug')) {
            environment.debug = true;
        }
        if (environment.debug) {
            Log('NRelay', 'Starting in debug mode...');
        } else {
            Log('NRelay', 'Starting...');
        }
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

    proceed(): void {
        Promise.all([ResourceManager.loadTileInfo(), ResourceManager.loadObjects()]).then(() => {
            PluginManager.loadPlugins();
        }).catch((error) => {
            Log('NRelay', 'An error occurred while loading tiles and objects. There may be some problems with plugins', LogLevel.Warning);
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
                this.getAccountInfo(acc.guid, acc.password).then((info) => {
                    const keys = Object.keys(this.serverList);
                    if (keys.length > 0) {
                        let server: IServer;
                        if (!this.serverList[acc.serverPref]) {
                            Log('NRelay', 'Preferred server not found. Choosing first server.', LogLevel.Warning);
                            server = this.serverList[keys[0]];
                        } else {
                            server = this.serverList[acc.serverPref];
                        }
                        info.guid = acc.guid;
                        info.password = acc.password;
                        const client = new Client(server, accInfo.buildVersion, info);
                    } else {
                        Log('NRelay', 'Couldn\'t get servers.', LogLevel.Error);
                    }
                }).catch((err) => {

                });
            }, (i * 1000));
        }
    }

    getServers(): Promise<{ [id: string]: IServer }> {
        Log('NRelay', 'Getting server list...', LogLevel.Info);
        return new Promise((resolve, reject) => {
            Http.get(SERVER_ENDPOINT).then((data) => {
                Log('NRelay', 'Got servers!', LogLevel.Success);
                const servers = parseServers(data);
                resolve(servers);
            }).catch((serverListError) => {
                Log('NRelay', 'Error getting servers.', LogLevel.Error);
                reject(serverListError);
            });
        });
    }

    getAccountInfo(guid: string, password: string): Promise<IAccount> {
        return new Promise((resolve, reject) => {
            Http.get(SERVER_ENDPOINT, {
                guid: guid,
                password: password
            }).then((data) => {
                const info = parseAccountInfo(data);
                this.serverList = parseServers(data);
                if (info) {
                    Log('NRelay', 'Authorized account', LogLevel.Success);
                    resolve(info);
                } else {
                    Log('NRelay', 'Error: ' + parseError(data), LogLevel.Warning);
                    reject();
                }
            }).catch((err) => reject(err));
        });
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
