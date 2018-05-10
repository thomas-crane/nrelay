import { IAccountInfo } from './../models';
import { Logger } from './logger';
import fs = require('fs');
import path = require('path');
const dir = path.dirname(require.main.filename);

export class Storage {
    /**
     * Gets the contents of the file at the specified filepath and returns the result as a JSON object.
     * @param filePath The path of the file to read from.
     */
    public static get(...filePath: string[]): Promise<any> {
        return new Promise((resolve: (data: any) => void, reject: (err: Error) => void) => {
            this.readText(...filePath).then((data) => {
                resolve(JSON.parse(data));
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Reads the contents of the file at the specified filepath and returns the result as plaintext.
     * @param filePath The path of the file to read from.
     */
    public static readText(...filePath: string[]): Promise<string> {
        return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
            const fileName = this.makePath(...filePath);
            fs.readFile(fileName, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    }

    /**
     * Writes the `data` string to the file at the specified filepath.
     * @param data The text to write.
     * @param filePath The path of the file to write to.
     */
    public static writeText(data: string, ...filePath: string[]): Promise<any> {
        return new Promise((resolve: () => void, reject: (err: Error) => void) => {
            const fileName = this.makePath(...filePath);
            fs.writeFile(fileName, data, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Creates a path relative to the `nrelay/` folder.
     * @example
     * ```
     * Storage.makePath('src', 'plugins');
     * // returns C:\path\to\nrelay\src\plugins
     * ```
     * @param filePath The path to create.
     */
    public static makePath(...filePath: string[]): string {
        return path.resolve(__dirname, path.join(dir, ...filePath));
    }

    /**
     * Serializes the `data` object and writes the serialized string to the specified filepath.
     * @param data The data to write.
     * @param filePath The path of the file to write to.
     */
    public static set(data: object, ...filePath: string[]): Promise<any> {
        return this.writeText(JSON.stringify(data), ...filePath);
    }

    /**
     * Gets the contents of the `acc-config.json` file and returns
     * it as an `IAccountInfo` object.
     */
    public static getAccountConfig(): IAccountInfo | Error {
        try {
            return require('./../../acc-config.json');
        } catch (err) {
            return err;
        }
    }

    /**
     * Creates a log file and sets the `Logger.logStream` property to the newly created write stream.
     */
    public static createLog(): void {
        const logStream = fs.createWriteStream(Storage.makePath('nrelay-log.log'));
        logStream.write(`Log Start (time: ${Date.now()})\n`);
        Logger.logStream = logStream;
    }
}
