import { Log, SeverityLevel } from './services/logger';
import { Http } from './services/http';
import { parseServers, parseAccountInfo, parseError } from './services/xmltojson';
import { SERVER_ENDPOINT } from './models/api-endpoints';
import { IServer } from './models/server';
import { IAccountInfo, IAccount } from './models/accinfo';
import { Client } from './core/client';
import { Storage } from './services/storage';
import { PluginManager } from './core/plugin-manager';
import { ResourceManager } from './core/resource-manager';

export class CLI {

    private serverList: { [id: string]: IServer };

    constructor() {
        Log('NRelay', 'Starting...');
        ResourceManager.loadTileInfo();
        PluginManager.loadPlugins();
        const accInfo = Storage.getAccountConfig();
        if (!accInfo) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', SeverityLevel.Error);
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
                            Log('NRelay', 'Preferred server not found. Choosing first server.', SeverityLevel.Warning);
                            server = this.serverList[keys[0]];
                        } else {
                            server = this.serverList[acc.serverPref];
                        }
                        Log('NRelay', 'Connecting to ' + server.name);
                        info.guid = acc.guid;
                        info.password = acc.password;
                        const client = new Client(server, accInfo.buildVersion, info);
                    } else {
                        Log('NRelay', 'Couldn\'t get servers.', SeverityLevel.Error);
                    }
                }).catch((err) => {

                });
            }, (i * 1000));
        }
    }

    getServers(): Promise<{ [id: string]: IServer }> {
        Log('NRelay', 'Getting server list...', SeverityLevel.Info);
        return new Promise((resolve, reject) => {
            Http.get(SERVER_ENDPOINT).then((data) => {
                Log('NRelay', 'Got servers!', SeverityLevel.Success);
                const servers = parseServers(data);
                resolve(servers);
            }).catch((serverListError) => {
                Log('NRelay', 'Error getting servers.', SeverityLevel.Error);
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
                    Log('NRelay', 'Authorized account', SeverityLevel.Success);
                    resolve(info);
                } else {
                    Log('NRelay', 'Error: ' + parseError(data), SeverityLevel.Warning);
                    reject();
                }
            }).catch((err) => reject(err));
        });
    }
}
