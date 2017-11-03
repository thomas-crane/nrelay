import http = require('http');

export class Http {
    static get(path: string, query?: { [id: string]: string }): Promise<any> {
        return new Promise((resolve, reject) => {
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
}
