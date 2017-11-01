import { IAccountInfo } from './../models/accinfo';
import fs = require('fs');
import path = require('path');

export class Storage {
    public static get(file: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, file), 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }

    public static set(file: string, data: object): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.resolve(__dirname, file), JSON.stringify(data), (error) => {
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
