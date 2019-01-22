/**
 * @module services
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

import * as https from 'https';
import { createWriteStream, PathLike } from 'fs';
import { Logger, LogLevel, Storage } from './../services';
import { ASSET_ENDPOINT, CLIENT_VERSION_ENDPOINT, CLIENT_DL_ENDPOINT } from '../models';
import { HttpClient } from './http';
import { PacketIdMap, PacketType, Mapper } from '../networking';

const PACKET_REGEX = /static const ([A-Z_]+):int = (\d+);/g;
const IMAGE_REGEX = /_(\w+)Embed_\.(png|jpg)$/;
const dir = path.dirname(require.main.filename);
const GSC_PATH = path.join(
  'scripts', 'kabam', 'rotmg', 'messaging',
  'impl', 'GameServerConnection.as'
);
const DEFAULT_SWF_PATH = path.join(dir, 'src', 'services', 'updater-assets');
const DEFAULT_VERSION_PATH = path.join(dir, 'versions.json');

/**
 * Information about the local version of the assets.
 */
export interface VersionInfo {
  clientVersion: string;
  assetVersion: string;
}

/**
 * A static singleton class used to update the local game assets and packet ids.
 */
export class Updater {

  /**
   * Checks if the remote client version matches the local client version.
   * @returns `true` if the `localVersion` does **not** match the remote version,
   * @param localVersion The local version of the client.
   */
  static isClientOutdated(localVersion: string): Promise<boolean> {
    return this.getRemoteClientVersion().then((version) => {
      return localVersion !== version;
    });
  }

  /**
   * Checks if the remote asset version matches the local asset version.
   * @returns `true` if the `localVersion` does **not** match the remote version,
   * @param localVersion The local version of the asset.
   */
  static areAssetsOutdated(localVersion: string): Promise<boolean> {
    return this.getRemoteAssetVersion().then((version) => {
      return localVersion !== version;
    });
  }

  /**
   * Reads the local version number from the updater assets.
   */
  static getCurrentVersion(versionPath: string = DEFAULT_VERSION_PATH): VersionInfo {
    try {
      return require(versionPath);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        const newVersionInfo: VersionInfo = {
          assetVersion: '0',
          clientVersion: '0'
        };
        fs.writeFileSync(versionPath, JSON.stringify(newVersionInfo));
        return newVersionInfo;
      } else {
        throw error;
      }
    }
  }

  /**
   * Stores the new asset `version` in the version info file at `versionPath`.
   * @param version The new version.
   * @param versionPath The path of the version info file.
   */
  static updateLocalAssetVersion(version: string, versionPath: string): void {
    const current = this.getCurrentVersion(versionPath);
    current.assetVersion = version;
    fs.writeFileSync(versionPath, JSON.stringify(current));
  }

  /**
   * Stores the new client `version` in the version info file at `versionPath`.
   * @param version The new version.
   * @param versionPath The path of the version info file.
   */
  static updateLocalClientVersion(version: string, versionPath: string): void {
    const current = this.getCurrentVersion(versionPath);
    current.clientVersion = version;
    fs.writeFileSync(versionPath, JSON.stringify(current));
  }

  /**
   * Downloads the latest client.swf to the updater assets folder.
   */
  static getClient(version: string): Promise<any> {
    const downloadPath = CLIENT_DL_ENDPOINT.replace('{{version}}', version);
    const clientPath = path.join(dir, 'src', 'services', 'updater-assets', 'client.swf');
    this.emptyFile(clientPath);
    const clientStream = createWriteStream(clientPath);
    return new Promise((resolve, reject) => {
      Logger.log('Updater', 'Downloading latest client.swf', LogLevel.Info);
      https.get(downloadPath, (res) => {
        res.on('data', (chunk) => {
          clientStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded client.swf', LogLevel.Success);
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
      Logger.log('Updater', 'Downloading latest GroundTypes.json', LogLevel.Info);
      https.get(ASSET_ENDPOINT + '/current/json/GroundTypes.json', (res) => {
        res.on('data', (chunk) => {
          groundTypesStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded GroundTypes.json', LogLevel.Success);
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
      Logger.log('Updater', 'Downloading latest Objects.json', LogLevel.Info);
      https.get(ASSET_ENDPOINT + '/current/json/Objects.json', (res) => {
        res.on('data', (chunk) => {
          objectsStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded Objects.json', LogLevel.Success);
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
   * Gets the remote client version.
   */
  static getRemoteClientVersion(): Promise<string> {
    return HttpClient.get(CLIENT_VERSION_ENDPOINT).then((result) => {
      return result.replace(/[^0-9]/g, '');
    });
  }

  /**
   * Gets the remote asset version.
   */
  static getRemoteAssetVersion(): Promise<string> {
    return HttpClient.get(ASSET_ENDPOINT + '/current/version.txt').then((result) => {
      return result.replace(/[^0-9]/g, '');
    });
  }

  /**
   * Gets the remote version of both the client and the assets.
   */
  static getRemoteVersions(): Promise<VersionInfo> {
    return Promise.all([
      this.getRemoteClientVersion(),
      this.getRemoteAssetVersion()
    ]).then((versions) => {
      return {
        clientVersion: versions[0],
        assetVersion: versions[1]
      };
    });
  }

  /**
   * Gets the latest assets and updates the local version number.
   */
  static getLatestAssets(): Promise<any> {
    return Promise.all([
      this.getGroundTypes(),
      this.getObjects()
    ]).then(() => {
      return this.getRemoteAssetVersion();
    }).then((version) => {
      return this.updateLocalAssetVersion(version, DEFAULT_VERSION_PATH);
    });
  }

  /**
   * Gets the latest client, updates the local packet ids, then updates the local version number.
   */
  static getLatestClient(): Promise<any> {
    let clientVersion: string;
    return this.getRemoteClientVersion().then((version) => {
      clientVersion = version;
      return this.getClient(clientVersion);
    }).then(() => {
      return this.updateFrom(DEFAULT_SWF_PATH);
    }).then(() => {
      return this.updateLocalClientVersion(clientVersion, DEFAULT_VERSION_PATH);
    });
  }

  /**
   * Downloads all of the latest assets, extracts and applies the
   * new packet ids, and updates the local version number.
   */
  static getLatest(): Promise<any> {
    return Promise.all([
      this.getLatestClient(),
      this.getLatestAssets()
    ]).then(() => {
      Logger.log('Updater', 'Finished!', LogLevel.Success);
    }).catch((error) => {
      Logger.log('Updater', `Error: ${error.message}`, LogLevel.Error);
    });
  }

  /**
   * Updates the packet ids using the client.swf inside the `parentDir`.
   * @param parentDir The directory containing the client.swf
   */
  static updateFrom(parentDir: string): Promise<any> {
    const realPath = parentDir.split(/\/|\\/g).join(path.sep);
    let swfDir = realPath;
    let swfName = 'client.swf';
    const stat = fs.statSync(realPath);
    if (stat.isFile()) {
      const parts = realPath.split(path.sep);
      swfName = parts.pop();
      swfDir = parts.join(path.sep);
    }
    return this.unpackSwf(swfDir, swfName).then(() => {
      Logger.log('Updater', 'Updating assets.', LogLevel.Info);
      const packets = this.extractPacketInfo(path.join(swfDir, 'decompiled', GSC_PATH));
      this.updatePackets(packets);
      this.updateTextures(path.join(swfDir, 'decompiled', 'images'));
    });
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
  private static unpackSwf(parentDir: string, swfName: string): Promise<any> {
    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
      Logger.log('Updater', `Unpacking ${swfName}`, LogLevel.Info);
      let args = [
        '-jar',
        (`"${path.join(dir, 'lib', 'jpexs', 'ffdec.jar')}"`),
        '-selectclass kabam.rotmg.messaging.impl.GameServerConnection',
        '-export script',
        (`"${path.join(parentDir, 'decompiled')}"`),
        (`"${path.join(parentDir, swfName)}"`)
      ];
      exec(`java ${args.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
      });
      args = [
        '-jar',
        (`"${path.join(dir, 'lib', 'jpexs', 'ffdec.jar')}"`),
        '-export image',
        (`"${path.join(parentDir, 'decompiled', 'images')}"`),
        (`"${path.join(parentDir, swfName)}"`)
      ];
      exec(`java ${args.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        Logger.log('Updater', `Unpacked ${swfName}`, LogLevel.Success);
        resolve();
      });
    });
  }

  /**
   * Update the textures from the given folder to `nrelay/resources/textures` folder.
   * @param assetPath The path to the folder that contain extracted assets.
   */
  private static updateTextures(assetPath: string): void {
    const DIR = Storage.makePath('resources', 'textures');
    fs.mkdirSync(DIR);
    const FILES = fs.readdirSync(assetPath);
    FILES.forEach((filename, index) => {
      const NAME = filename.match(IMAGE_REGEX);
      if (NAME) {
        fs.copyFileSync(`${assetPath}/${filename}`, `${DIR}/${NAME[1]}.${NAME[2]}`);
      }
    });

  }

  /**
   * Extracts the packet information from the given file.
   * @param assetPath The path to the file containing the extracted packet ids.
   */
  private static extractPacketInfo(assetPath: string): PacketIdMap {
    let raw = null;
    raw = fs.readFileSync(assetPath, { encoding: 'utf8' });
    const packets: PacketIdMap = {};
    let match = PACKET_REGEX.exec(raw);
    while (match != null) {
      packets[+match[2]] = match[1].replace('_', '') as PacketType;
      match = PACKET_REGEX.exec(raw);
    }
    Logger.log('Updater', 'Extracted packet info.', LogLevel.Success);
    return packets;
  }

  /**
   * Converts the `newPackets` to an enum and writes the result
   * to the `packet-type.ts` file.
   * @param newPackets The packet name/id map to use.
   */
  private static updatePackets(newPackets: PacketIdMap): void {
    const filePath = path.join(dir, 'packets.json');
    fs.writeFileSync(filePath, JSON.stringify(newPackets), { encoding: 'utf8' });
    Mapper.mapIds(newPackets);
    Logger.log('Updater', 'Updated packets.json', LogLevel.Success);
  }
}
