import fs = require('fs');
import path = require('path');
import { exec, spawn } from 'child_process';
import * as os from 'os';

import https = require('https');
import { createWriteStream, PathLike } from 'fs';
import { Log, LogLevel } from './../services';
import { HttpClient } from './http';
import { ASSET_ENDPOINT } from '../models';

const PACKET_REGEX = /static const ([A-Z_]+):int = (\d+);/g;
const dir = path.dirname(require.main.filename);

export class Updater {

    /**
     * Checks if `currentVersion` matches the remote version number.
     * @param currentVersion The version number to check.
     */
    static isOutdated(currentVersion: string): Promise<boolean> {
        return this.getVersionNumber().then((version) => {
            return currentVersion !== version;
        });
    }

    /**
     * Reads the local version number from the updater assets.
     */
    static getCurrentVersion(): string {
        const filename = path.join(dir, 'src', 'services', 'updater-assets', 'version.txt');
        try {
            return fs.readFileSync(filename, { encoding: 'utf8' });
        } catch {
            try {
                fs.mkdirSync(path.join(dir, 'src', 'services', 'updater-assets'));
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
            fs.writeFileSync(filename, '', { encoding: 'utf8' });
            return '';
        }
    }

    /**
     * Downloads the latest client.swf to the updater assets folder.
     */
    static getClient(): Promise<any> {
        const clientPath = path.join(dir, 'src', 'services', 'updater-assets', 'client.swf');
        this.emptyFile(clientPath);
        const clientStream = createWriteStream(clientPath);
        return new Promise((resolve, reject) => {
            Log('Updater', 'Downloading latest client.swf', LogLevel.Info);
            https.get(ASSET_ENDPOINT + '/current/client.swf', (res) => {
                res.on('data', (chunk) => {
                    clientStream.write(chunk);
                });
                res.once('end', () => {
                    Log('Updater', 'Downloaded client.swf', LogLevel.Success);
                    clientStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('error');
                    resolve();
                });
                res.once('error', (error) => {
                    clientStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('end');
                    reject(error);
                });
            });
        });
    }

    /**
     * Downdloads the latest GroundTypes.json to the updater assets folder.
     */
    static getGroundTypes(): Promise<any> {
        if (!fs.existsSync(path.join(dir, 'resources'))) {
            fs.mkdirSync(path.join(dir, 'resources'));
        }
        const groundTypesPath = path.join(dir, 'resources', 'GroundTypes.json');
        this.emptyFile(groundTypesPath);
        const groundTypesStream = createWriteStream(groundTypesPath);
        return new Promise((resolve, reject) => {
            Log('Updater', 'Downloading latest GroundTypes.json', LogLevel.Info);
            https.get(ASSET_ENDPOINT + '/current/json/GroundTypes.json', (res) => {
                res.on('data', (chunk) => {
                    groundTypesStream.write(chunk);
                });
                res.once('end', () => {
                    Log('Updater', 'Downloaded GroundTypes.json', LogLevel.Success);
                    groundTypesStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('error');
                    resolve();
                });
                res.once('error', (error) => {
                    groundTypesStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('end');
                    reject(error);
                });
            });
        });
    }

    /**
     * Downloads the latest Objects.json to the updater asssets folder.
     */
    static getObjects(): Promise<any> {
        const objectsPath = path.join(dir, 'resources', 'Objects.json');
        this.emptyFile(objectsPath);
        const objectsStream = createWriteStream(objectsPath);
        return new Promise((resolve, reject) => {
            Log('Updater', 'Downloading latest Objects.json', LogLevel.Info);
            https.get(ASSET_ENDPOINT + '/current/json/Objects.json', (res) => {
                res.on('data', (chunk) => {
                    objectsStream.write(chunk);
                });
                res.once('end', () => {
                    Log('Updater', 'Downloaded Objects.json', LogLevel.Success);
                    objectsStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('error');
                    resolve();
                });
                res.once('error', (error) => {
                    objectsStream.end();
                    res.removeAllListeners('data');
                    res.removeAllListeners('end');
                    reject(error);
                });
            });
        });
    }

    /**
     * Gets the latest version number.
     */
    static getVersionNumber(): Promise<string> {
        return new Promise((resolve: (result: string) => void, reject: (err: Error) => void) => {
            https.get(ASSET_ENDPOINT + '/current/version.txt', (res) => {
                let raw = '';
                res.on('data', (chunk) => {
                    raw += chunk;
                });
                res.once('end', () => {
                    resolve(raw);
                });
                res.once('error', (error) => {
                    res.removeAllListeners('data');
                    res.removeAllListeners('end');
                    reject(error);
                });
            });
        });
    }

    /**
     * Downloads all of the latest assets, extracts and applies the
     * new packet ids, and updates the local version number.
     */
    static getLatest(): Promise<any> {
        return Promise.all([
            this.getClient(),
            this.getGroundTypes(),
            this.getObjects()
        ]).then(() => {
            Log('Updater', 'Unpacking client.swf', LogLevel.Info);
            return this.unpackSwf();
        }).then(() => {
            Log('Updater', 'Unpacked client.swf', LogLevel.Success);
            Log('Updater', 'Updating assets', LogLevel.Info);
            const FILEPATH = path.join(
                dir,
                'src', 'services', 'updater-assets', 'decompiled', 'scripts',
                'kabam', 'rotmg', 'messaging', 'impl', 'GameServerConnection.as'
            );
            const packets = this.extractPacketInfo(FILEPATH);
            this.updatePackets(packets);
            Log('Updater', 'Updated assets. Updating local version number.');
            return this.getVersionNumber();
        }).then((version) => {
            this.updateVersion(version);
            Log('Updater', 'Finished! Rebuilding source...', LogLevel.Success);
            return this.rebuildSource();
        }).then(() => {
            Log('Updater', 'Finished rebuilding source!', LogLevel.Success);
        }).catch((error) => {
            Log('Updater', `Error: ${error.message}`, LogLevel.Error);
        });
    }

    /**
     * Invokes the gulp process to rebuild the source.
     */
    private static rebuildSource(): Promise<any> {
        return new Promise((resolve, reject) => {
            const gulpCmd = os.platform() === 'win32' ? 'gulp.cmd' : 'gulp';
            const child = spawn(path.join(dir, 'node_modules', '.bin', gulpCmd), []);
            child.stdout.on('data', (data) => {
                for (const line of this.cleanGulpOutput(data)) {
                    Log('gulp', line, LogLevel.Info);
                }
            });
            child.stderr.on('data', (data) => {
                for (const line of this.cleanGulpOutput(data)) {
                    Log('gulp', line, LogLevel.Error);
                }
            });
            child.once('exit', () => {
                resolve();
            });
            child.once('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Cleans the gulp process output.
     * @param data The output to clean.
     */
    private static cleanGulpOutput(data: string | Buffer): string[] {
        const lines = data.toString().split('\n');
        return lines.filter((line) => line && !/^\s*\[\d{2}:\d{2}:\d{2}\]\s*$/.test(line));
    }

    /**
     * Ensures that the given file is empty.
     * @param filePath The file to empty.
     */
    private static emptyFile(filePath: PathLike): void {
        try {
            fs.truncateSync(filePath, 0);
        } catch (error) {
            if (error.code === 'ENOENT') {
                fs.writeFileSync(filePath, '', { encoding: 'utf8' });
            } else {
                throw error;
            }
        }
    }

    /**
     * Unpacks the client in the updater assets.
     */
    private static unpackSwf(): Promise<any> {
        return new Promise((resolve: () => void, reject: (err: Error) => void) => {
            const args = [
                '-jar',
                (`"${path.join(dir, 'lib', 'jpexs', 'ffdec.jar')}"`),
                '-selectclass kabam.rotmg.messaging.impl.GameServerConnection',
                '-export script',
                (`"${path.join(dir, 'src', 'services', 'updater-assets', 'decompiled')}"`),
                (`"${path.join(dir, 'src', 'services', 'updater-assets', 'client.swf')}"`)
            ];
            exec(`java ${args.join(' ')}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     * Extracts the packet information from the given file.
     * @param assetPath The path to the file containing the extracted packet ids.
     */
    private static extractPacketInfo(assetPath: string): { [id: string]: number } {
        let raw = null;
        raw = fs.readFileSync(assetPath, { encoding: 'utf8' });
        const packets: {
            [id: string]: number
        } = {};
        let match = PACKET_REGEX.exec(raw);
        while (match != null) {
            packets[match[1].replace('_', '')] = +match[2];
            match = PACKET_REGEX.exec(raw);
        }
        return packets;
    }

    /**
     * Converts the `newPackets` to an enum and writes the result
     * to the `packet-type.ts` file.
     * @param newPackets The packet name/id map to use.
     */
    private static updatePackets(newPackets: { [id: string]: number }): void {
        const filePath = path.join(dir, 'src', 'networking', 'packet-type.ts');
        fs.truncateSync(filePath, 0);
        let raw = 'export enum PacketType {\n';
        const keys = Object.keys(newPackets);
        for (let i = 0; i < keys.length; i++) {
            raw += (`    ${keys[i]} = ${newPackets[keys[i]] + (i === keys.length - 1 ? '\n' : ',\n')}`);
        }
        raw += '}\n';
        fs.writeFileSync(filePath, raw, { encoding: 'utf8' });
        Log('Updater', 'Updated PacketType enum', LogLevel.Info);
    }

    /**
     * Writes the `newVersion` to the local version number storage.
     * @param newVersion The version number to write.
     */
    private static updateVersion(newVersion: string): void {
        const filePath = path.join(dir, 'src', 'services', 'updater-assets', 'version.txt');
        fs.truncateSync(filePath, 0);
        fs.writeFileSync(filePath, newVersion, { encoding: 'utf8' });
    }
}
