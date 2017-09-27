import http = require('http');

export class Http {
    static get(path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            http.get(path, (response) => {
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