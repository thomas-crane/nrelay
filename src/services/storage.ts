import { IAccountInfo } from './../models/accinfo';
import fs = require('fs');
import path = require('path');
const dir = path.dirname(require.main.filename);

export class Storage {
    public static get(...filePath: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileName = this.makePath(...filePath);
            fs.readFile(fileName, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }

    public static makePath(...filePath: string[]): string {
        return path.resolve(__dirname, path.join(dir, ...filePath));
    }

    public static set(data: object, ...filePath: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileName = this.makePath(...filePath);
            fs.writeFile(fileName, JSON.stringify(data), (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public static getAccountConfig(): IAccountInfo {
        try {
            return require('./../../acc-config.json');
        } catch (err) {
            return null;
        }
    }
}
