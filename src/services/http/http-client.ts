/**
 * @module services/http
 */
import * as url from 'url';
import * as qs from 'querystring';
import { Proxy } from '../../models';
import { Http } from './http';
import { Https } from './https';
import { SocksClient } from 'socks';
import { Logger, LogLevel } from '../logger';

/**
 * A static helper class used to provide an interface for Promise based web requests.
 */
export class HttpClient {
  /**
   * Makes a GET request to the specified path.
   * @param path The path to make the GET request to.
   * @param options The options to use while making the request.
   */
  static get(path: string, options: RequestOptions = { query: {}, proxy: null }): Promise<string> {
    const endpoint = url.parse(path);
    if (!/https?:/.test(endpoint.protocol)) {
      return Promise.reject(new Error(`Unsupported protocol: "${endpoint.protocol}"`));
    }
    let queryString = qs.stringify(options.query);
    if (queryString) {
      queryString = `?${queryString}`;
    }
    if (options.proxy) {
      return this.getWithProxy(endpoint, options.proxy, queryString);
    } else {
      if (endpoint.protocol === 'http:') {
        return Http.get(path, queryString);
      } else {
        return Https.get(path, queryString);
      }
    }
  }

  /**
   * Makes a POST request to the specified path and passes the provided parameters.
   * @param path The path to make the POST request to.
   * @param params The POST parameters to include.
   */
  static post(path: string, params?: { [id: string]: any }): Promise<string> {
    const endpoint = url.parse(path);
    if (!/https?:/.test(endpoint.protocol)) {
      return Promise.reject(new Error(`Unsupported protocol: "${endpoint.protocol}"`));
    }
    if (endpoint.protocol === 'http:') {
      return Http.post(endpoint, params);
    } else {
      return Https.post(endpoint, params);
    }
  }

  private static getWithProxy(endpoint: url.Url, proxy: Proxy, query: string): Promise<any> {
    return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
      let provider = 'Http';
      let port = 80;
      if (endpoint.protocol === 'https:') {
        provider = 'Https';
        port = 443;
      }
      Logger.log(provider, 'Establishing proxy for GET request.', LogLevel.Info);
      SocksClient.createConnection({
        destination: {
          host: endpoint.host,
          port: port
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
        Logger.log(provider, 'Established proxy!', LogLevel.Success);
        let data = '';
        info.socket.setEncoding('utf8');
        info.socket.write(`GET ${endpoint.path}${query} HTTP/1.1\r\n`);
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
}

export interface RequestOptions {
  query?: { [id: string]: any };
  proxy?: Proxy;
}
