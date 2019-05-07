import * as resx from '@realmlib/resx';
import * as fs from 'fs';
import { Logger, LogLevel } from '../core';
import { Environment } from '../runtime/environment';
import { Versions } from '../runtime/versions';

/**
 * The result of checking for updated versions of assets.
 */
export interface UpdateCheckResult {
  needClientUpdate: boolean;
  needAssetUpdate: boolean;
}

export class Updater {
  constructor(readonly env: Environment) { }

  /**
   * Checks if the client or assets need updating and returns
   * an update check result which can be passed to `performUpdate`.
   */
  checkForUpdates(): Promise<UpdateCheckResult> {
    Logger.log('Updater', 'Checking for new versions...', LogLevel.Info);
    return resx.getVersions().then((versions) => {
      const localVersion = this.env.readJSON<Versions>('versions.json');
      if (!localVersion) {
        return {
          needClientUpdate: true,
          needAssetUpdate: true,
        };
      } else {
        return {
          needClientUpdate: localVersion.clientVersion !== versions.clientVersion,
          needAssetUpdate: localVersion.assetVersion !== versions.assetVersion,
        };
      }
    });
  }

  /**
   * Performs the necessary updates according to the update info.
   * @param updateInfo The update check result to use when performing the update.
   */
  performUpdate(updateInfo: UpdateCheckResult): Promise<void> {
    if (updateInfo.needAssetUpdate && updateInfo.needClientUpdate) {
      Logger.log('Updater', 'Updating client and assets...', LogLevel.Info);
      return Promise.all([
        this.updateAssets(),
        this.updateClient(),
      ]).then(() => undefined);
    }
    if (updateInfo.needAssetUpdate) {
      Logger.log('Updater', 'Updating assets...', LogLevel.Info);
      return this.updateAssets();
    }
    if (updateInfo.needClientUpdate) {
      Logger.log('Updater', 'Updating client...', LogLevel.Info);
      return this.updateClient();
    }
    return Promise.resolve();
  }

  /**
   * Downloads the latest assets into the resources directory.
   */
  private updateAssets(): Promise<void> {
    const groundTypesStream = fs.createWriteStream(this.env.pathTo('resources', 'GroundTypes.json'));
    const objectsStream = fs.createWriteStream(this.env.pathTo('resources', 'Objects.json'));

    return Promise.all([
      resx.getAssetVersion(),
      resx.getGroundTypes(groundTypesStream),
      resx.getObjects(objectsStream),
    ]).then(([assetVersion]) => {
      Logger.log('Updater', 'Updated assets!', LogLevel.Success);
      this.env.updateJSON({ assetVersion }, 'versions.json');
    });
  }

  /**
   * Updates the packets.json file by downloaded the latest client
   * and extracting the packet ids.
   */
  private updateClient(): Promise<void> {
    this.env.mkTempDir();
    let clientVersion: string;
    const filePath = this.env.pathTo('temp', 'client.swf');
    const fileStream = fs.createWriteStream(filePath);
    return resx.getClientVersion().then((version) => {
      clientVersion = version;
      return resx.getClient(version, fileStream);
    }).then(() => {
      return resx.unpackSwf(filePath);
    }).then((decompiledPath) => {
      const gscPath = resx.makeGSCPath(decompiledPath);
      const gscContents = fs.readFileSync(gscPath, { encoding: 'utf8' });
      const packets = resx.extractPacketInfo(gscContents);
      this.env.writeJSON(packets, 'packets.json');
      this.env.updateJSON({ clientVersion }, 'versions.json');
      this.env.rmTempDir();
      Logger.log('Updater', 'Updated client!', LogLevel.Success);
    });
  }
}
