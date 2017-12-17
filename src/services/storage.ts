import { IAccountInfo } from './../models/accinfo';
import fs = require('fs');
import path = require('path');
const dir = path.dirname(require.main.filename);

export class Storage {
    public static get(...filePath: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileName = path.join(dir, ...filePath);
            fs.readFile(path.resolve(__dirname, fileName), 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }

    public static set(data: object, ...filePath: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileName = path.join(dir, ...filePath);
            fs.writeFile(path.resolve(__dirname, fileName), JSON.stringify(data), (error) => {
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
