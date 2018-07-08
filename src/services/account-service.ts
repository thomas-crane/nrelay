import { IProxy, ICharacterInfo, SERVER_ENDPOINT, IServer } from '../models';
import { HttpClient } from './http';
import { XMLtoJSON } from './xmltojson';
import * as net from 'net';
import * as dns from 'dns';
import { Log, LogLevel } from '../core';
import { Storage } from './storage';

const ACCOUNT_IN_USE_REGEX = /Account in use \((\d+) seconds? until timeout\)/;
const ERROR_REGEX = /<Error\/?>(.+)<\/?Error>/;

export class AccountService {

    /**
     * Ensures that the `proxy` has an IPv4 or IPv6 as the
     * host instead of a hostname.
     * @param proxy The proxy to resolve.
     */
    static resolveProxyHostname(proxy: IProxy): Promise<void> {
        if (!proxy) {
            return Promise.resolve();
        }
        if (net.isIP(proxy.host) === 0) {
            Log('AccountService', 'Resolving proxy hostname.', LogLevel.Info);
            return new Promise((resolve, reject) => {
                dns.lookup(proxy.host, (err, address) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    Log('AccountService', 'Proxy hostname resolved!', LogLevel.Success);
                    proxy.host = address;
                    resolve();
                });
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Gets the list of servers, or returns the cached version.
     */
    static getServerList(): Promise<{ [name: string]: IServer }> {
        if (this.internalServerList) {
            return Promise.resolve(this.internalServerList);
        }
        Log('AccountService', 'Loading server list', LogLevel.Info);
        return HttpClient.get(SERVER_ENDPOINT).then((response) => {
            this.checkErrors(response);
            Log('AccountService', 'Server list loaded.', LogLevel.Success);
            this.internalServerList = XMLtoJSON.parseServers(response);
            return Storage.set(this.internalServerList, 'last-known-servers.json');
        }).then(() => {
            Log('AccountService', 'Cached server list.', LogLevel.Success);
            return this.internalServerList;
        }).catch((error) => {
            // try to read last-known-servers.json
            return Storage.get('last-known-servers.json');
        }).then((servers) => {
            this.internalServerList = servers;
            return this.internalServerList;
        }).catch((error) => {
            console.log(error);
            return {};
        });
    }

    /**
     * Gets the character info for the account provided.
     * @param guid The account email.
     * @param password The account password.
     * @param proxy An optional proxy to use for the request.
     */
    static getCharacterInfo(guid: string, password: string, proxy?: IProxy): Promise<ICharacterInfo> {
        return HttpClient.get(SERVER_ENDPOINT, {
            proxy: proxy,
            query: {
                guid, password
            }
        }).then((response) => {
            if (!response) {
                throw new Error(`Empty response from server.`);
            }
            this.checkErrors(response);
            const info = XMLtoJSON.parseAccountInfo(response);
            this.internalServerList = XMLtoJSON.parseServers(response);
            return info;
        });
    }

    private static internalServerList: { [name: string]: IServer };

    private static checkErrors(response: string): void {
        const accInUse = ACCOUNT_IN_USE_REGEX.exec(response);
        if (accInUse) {
            const error = new Error(`Account in use.`);
            error.name = 'ACCOUNT_IN_USE';
            (error as any).timeout__ = +accInUse[1];
            throw error;
        }
        const otherError = ERROR_REGEX.exec(response);
        if (otherError) {
            const error = new Error(`${otherError[1]}`);
            error.name = 'OTHER_ERROR';
            throw error;
        }
    }
}
