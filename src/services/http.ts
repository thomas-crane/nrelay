import http = require('http');
import querystring = require('querystring');
import url = require('url');
import { IProxy } from './../models';
import { Socket } from 'net';
import { SocksClient, SocksClientOptions } from 'socks';
import { Log, LogLevel } from './logger';

export class Http {
    static get(path: string, query?: { [id: string]: string }): Promise<any> {
        return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
            const qs = this.parseQueryString(query);
            http.get(path + qs, (response) => {
                response.setEncoding('utf8');
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    resolve(data);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    static proxiedGet(path: string, proxy: IProxy, query?: { [id: string]: string }): Promise<any> {
        return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
            const endpoint = url.parse(path);
            const qs = this.parseQueryString(query);
            Log('Http', 'Establishing proxy for GET request.', LogLevel.Info);
            const socket = SocksClient.createConnection({
                destination: {
                    host: endpoint.host,
                    port: 80
                },
                command: 'connect',
                proxy: {
                    ipaddress: proxy.host,
                    port: proxy.port,
                    type: proxy.type,
                    userId: proxy.userId,
                    password: proxy.password
                }
            }).then((info) => {
                Log('Http', 'Established proxy!', LogLevel.Success);
                let data = '';
                info.socket.setEncoding('utf8');
                info.socket.write(`GET /char/list${qs} HTTP/1.1\r\n`);
                info.socket.write(`Host: ${endpoint.host}\r\n`);
                info.socket.write('Connection: close\r\n\r\n');
                info.socket.on('data', (chunk) => {
                    data += chunk.toString('utf8');
                });
                info.socket.once('close', (err) => {
                    info.socket.removeAllListeners('data');
                    info.socket.removeAllListeners('error');
                    info.socket.destroy();
                    resolve(data);
                });
                info.socket.once('error', (err) => {
                    info.socket.removeAllListeners('data');
                    info.socket.removeAllListeners('close');
                    info.socket.destroy();
                    reject(err);
                });
            }, reject);
        });
    }

    static post(path: string, params?: { [id: string]: any }): Promise<any> {
        return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
            const endpoint = url.parse(path);
            const postData = querystring.stringify(params);
            const options = {
                host: endpoint.host,
                path: endpoint.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const req = http.request(options, (response) => {
                response.setEncoding('utf8');
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    resolve(data);
                });
            }).on('error', (error) => {
                reject(error);
            });
            req.write(postData);
            req.end();
        });
    }

    private static parseQueryString(query: { [id: string]: string } | null): string {
        if (!query) {
            return '';
        }
        let qs = '';
        const keys = Object.keys(query);
        for (let i = 0; i < keys.length; i++) {
            if (i === 0) {
                qs += '?';
            }
            qs += encodeURIComponent(keys[i]);
            qs += '=';
            qs += encodeURIComponent(query[keys[i]]);
            if (i !== keys.length - 1) {
                qs += '&';
            }
        }
        return qs;
    }
}
