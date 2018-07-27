/**
 * @module services/http
 */
import * as https from 'https';
import * as url from 'url';
import * as qs from 'querystring';

/**
 * A class used internally by the `HttpClient` to work with https urls.
 *
 * @see HttpClient The `HttpClient` class should be used instead of this one.
 */
export class Https {
  /**
   * This method is used internally by the `HttpClient` class.
   *
   * **It is not recommended to use this method directly. Use `HttpClient.get` instead.**
   */
  static get(path: string, query: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(path + query, (response) => {
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
    });
  }

  /**
   * This method is used internally by the `HttpClient` class.
   *
   * **It is not recommended to use this method directly. Use `HttpClient.post` instead.**
   */
  static post(endpoint: url.Url, params: { [id: string]: any }): Promise<string> {
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
      const req = https.request(options, (response) => {
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
