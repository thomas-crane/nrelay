import { IProxy } from "../models";
import { Log, LogLevel } from "../core";
import { Http } from './http';
const ProxyLists = require('proxy-lists');

const PROXY_LISTS_CONFIG = {
	filterMode: 'strict',
	protocols: ['socks5'],
	anonymityLevels: ['anonymous', 'elite'],
	series: false,
    ipTypes: ['ipv4'],
    sourcesWhiteList: ['freeproxylists', 'gatherproxy'],
    countries: ['us']
};

export class ProxyGrabber {
    public static getProxies(): Promise<IProxy[]> {
        return new Promise((resolve: (proxies: IProxy[]) => void, reject: (err: Error) => void) => {

            var retrived: any[] = [];

            const getProxys = ProxyLists.getProxies(PROXY_LISTS_CONFIG);
            getProxys.on('data', (proxies: any) => {
                for(let i = 0; i < proxies.length; i++) {
                    retrived.push(proxies[i]);
                }
            });
            getProxys.on('end', () => {
                Log('Proxy Grabber', 'Done getting proxies! Scraped: ' + retrived.length, LogLevel.Info);
                let tests: Promise<IProxy>[] = [];
                for(let i = 0; i < retrived.length; i++) {
                    tests.push(this.testProxy(retrived[i]));
                }

                const toResultObject = (promise: any) => {
                    return promise
                    .then((result: any) => ({ success: true, result }))
                    .catch((error: any) => ({ success: false, error }));
                };                

                Promise.all(tests.map(toResultObject)).then((values: any) => {
                    let list = [];
                    for (let i = 0; i < values.length; ++i) {
                        if (values[i].success) {
                            list.push(values[i].result as IProxy);
                        }
                    }
                    Log('Proxy Grabber', 'Done checking proxies! Good: ' + list.length + ' Checking proxies...', LogLevel.Info);
                    resolve(list);
                });
            });
        });
    }
    public static testProxy(proxy: any): Promise<IProxy> {
        return new Promise((resolve: (proxy: IProxy) => void, reject: (err: Error) => void) => {
            let iproxy = {
                host: proxy.ipAddress,
                port: proxy.port,
                type: 5
            } as IProxy
            Http.proxiedGet('http://httpbin.org/ip', iproxy ).then((result: any) => {
                resolve(iproxy);
            }, (err) => reject(err));
        });
    }
}
