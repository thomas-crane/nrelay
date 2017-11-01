import { Log, SeverityLevel } from './services/logger';
import { Http } from './services/http';
import { parseServers, parseAccountInfo } from './services/xmltojson';
import { SERVER_ENDPOINT } from './models/api-endpoints';
import { IServer } from './models/server';
import { IAccountInfo } from './models/accinfo';
import { Client } from './core/client';
import { Storage } from './services/storage';

export class CLI {

    private serverList: { [id: string]: IServer };

    constructor() {
        Log('NRelay', 'Starting...', SeverityLevel.Info);
        const accInfo = Storage.getAccountConfig();
        if (!accInfo) {
            Log('NRelay', 'Couldn\'t load acc-config.json.', SeverityLevel.Error);
            return;
        }

        this.getAccountInfo(accInfo.guid, accInfo.password).then((info) => {
            const keys = Object.keys(this.serverList);
            if (keys.length > 0) {
                let server: IServer;
                if (!this.serverList[accInfo.serverPref]) {
                    Log('NRelay', 'Preferred server not found. Choosing first server.', SeverityLevel.Warning);
                    server = this.serverList[keys[0]];
                } else {
                    server = this.serverList[accInfo.serverPref];
                }
                Log('NRelay', 'Connecting to ' + server.name);
                info.buildVersion = accInfo.buildVersion;
                info.guid = accInfo.guid;
                info.password = accInfo.password;
                const client = new Client(server.address, info);
            } else {
                Log('NRelay', 'Couldn\'t get servers.', SeverityLevel.Error);
            }
        }).catch((err) => {

        });
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

    getAccountInfo(guid: string, password: string): Promise<IAccountInfo> {
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
                    console.log(data);
                    Log('NRelay', 'Error authorizing account', SeverityLevel.Warning);
                    reject();
                }
            }).catch((err) => reject(err));
        });
    }
}
