/**
 * @module services/http
 */
import * as http from 'http';
import * as qs from 'querystring';
import * as url from 'url';
import { REQUEST_HEADERS, HttpClient } from './http-client';

/**
 * A class used internally by the `HttpClient` to work with http urls.
 *
 * @see HttpClient The `HttpClient` class should be used instead of this one.
 */
export class Http {
  /**
   * This method is used internally by the `HttpClient` class.
   *
   * **It is not recommended to use this method directly. Use `HttpClient.get` instead.**
   */
  static get(path: string, query: string): Promise<string> {
    const opts: http.RequestOptions = {
      hostname: path,
      path: query,
      method: 'GET',
      headers: REQUEST_HEADERS
    };
    return new Promise((resolve, reject) => {
      const req = http.get(opts, (response) => {
        if (response.headers['content-encoding'] === 'gzip') {
          HttpClient.unzip(response).then(resolve, reject);
        } else {
          const data: Buffer[] = [];
          response.on('data', (chunk) => {
            data.push(chunk as Buffer);
          });
          response.once('end', () => {
            response.removeAllListeners('data');
            response.removeAllListeners('error');
            const str = Buffer.concat(data).toString();
            resolve(str);
          });
          response.once('error', (error) => {
            response.removeAllListeners('data');
            response.removeAllListeners('end');
            reject(error);
          });
        }
      });
      req.end();
    });
  }

  /**
   * This method is used internally by the `HttpClient` class.
   *
   * **It is not recommended to use this method directly. Use `HttpClient.post` instead.**
   */
  static post(endpoint: url.Url, params?: { [id: string]: any }): Promise<any> {
    return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
      const postData = qs.stringify(params);
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
        response.once('end', () => {
          response.removeAllListeners('data');
          response.removeAllListeners('error');
          resolve(data);
        });
        response.once('error', (error) => {
          response.removeAllListeners('data');
          response.removeAllListeners('end');
          reject(error);
        });
      });
      req.write(postData);
      req.end();
    });
  }
}
