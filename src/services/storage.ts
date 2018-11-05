/**
 * @module services
 */
import { AccountInfo } from './../models';
import { Logger, LogLevel } from './logger';
import * as fs from 'fs';
import * as path from 'path';
const dir = path.dirname(require.main.filename);
const BUILD_VERSION_REGEX = /"buildVersion":\s*"([X.0-9]+)"/;
// tslint:disable-next-line:no-var-requires
const packageFile = require('../../package.json');

/**
 * A static singleton class used to provide utility methods for interacting with the filesystem.
 */
export class Storage {
  /**
   * Gets the contents of the file at the specified filepath and returns the result as a JSON object.
   * @param filePath The path of the file to read from.
   */
  static get(...filePath: string[]): Promise<any> {
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
  static readText(...filePath: string[]): Promise<string> {
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
  static writeText(data: string, ...filePath: string[]): Promise<void> {
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
  static makePath(...filePath: string[]): string {
    return path.resolve(__dirname, path.join(dir, ...filePath));
  }

  /**
   * Serializes the `data` object and writes the serialized string to the specified filepath.
   * @param data The data to write.
   * @param filePath The path of the file to write to.
   */
  static set(data: object, ...filePath: string[]): Promise<void> {
    return this.writeText(JSON.stringify(data), ...filePath);
  }

  /**
   * Gets the contents of the `acc-config.json` file and returns
   * it as an `IAccountInfo` object.
   */
  static getAccountConfig(): AccountInfo {
    return require('./../../acc-config.json');
  }

  /**
   * Replaces the "buildVersion" value in the acc-config with `newVersion`.
   * @param newVersion The new value to use.
   */
  static updateBuildVersion(newVersion: string): void {
    this.readText('acc-config.json').then((text) => {
      const match = BUILD_VERSION_REGEX.exec(text);
      if (!match) {
        throw new Error('Cannot find buildVersion in acc-config.json');
      }
      if (match[1] === newVersion) {
        return;
      }
      Logger.log('Storage', 'Updating acc-config buildVersion', LogLevel.Info);
      const newText = text.replace(match[0], match[0].replace(match[1], newVersion));
      return this.writeText(newText, 'acc-config.json');
    }).then(() => {
      Logger.log('Storage', `Updated acc-config buildVersion to ${newVersion}!`, LogLevel.Success);
    }).catch((error) => {
      Logger.log('Storage', 'Error while updating acc-config buildVersion.', LogLevel.Warning);
      Logger.log('Storage', error.message, LogLevel.Warning);
    });
  }

  /**
   * Creates a log file and returns a `WriteStream` for it.
   */
  static createLog(): fs.WriteStream {
    const logStream = fs.createWriteStream(Storage.makePath('nrelay-log.log'));
    const watermark = [
      '@==---------==@',
      `@ date           :: ${(new Date()).toString()}`,
      `@ nrelay version :: v${packageFile.version}`,
      `@ node version   :: ${process.version}`,
      '@==---------==@'
    ].join('\n');
    logStream.write(`${watermark}\n`);
    return logStream;
  }
}
