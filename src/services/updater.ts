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
  async checkForUpdates(): Promise<UpdateCheckResult> {
    Logger.log('Updater', 'Checking for new versions...', LogLevel.Info);
    const versions = await resx.getVersions();
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
  }

  /**
   * Performs the necessary updates according to the update info.
   * @param updateInfo The update check result to use when performing the update.
   */
  async performUpdate(updateInfo: UpdateCheckResult): Promise<void> {
    if (updateInfo.needAssetUpdate && updateInfo.needClientUpdate) {
      Logger.log('Updater', 'Updating client and assets...', LogLevel.Info);
      await Promise.all([
        this.updateAssets(),
        this.updateClient(),
      ]);
    } else {
      if (updateInfo.needAssetUpdate) {
        Logger.log('Updater', 'Updating assets...', LogLevel.Info);
        return this.updateAssets();
      }
      if (updateInfo.needClientUpdate) {
        Logger.log('Updater', 'Updating client...', LogLevel.Info);
        return this.updateClient();
      }
    }
  }

  /**
   * Downloads the latest assets into the resources directory.
   */
  private async updateAssets(): Promise<void> {
    const groundTypesStream = fs.createWriteStream(this.env.pathTo('resources', 'GroundTypes.json'));
    const objectsStream = fs.createWriteStream(this.env.pathTo('resources', 'Objects.json'));

    Logger.log('Updater', 'Downloading assets...', LogLevel.Info);
    const [assetVersion] = await Promise.all([
      resx.getAssetVersion(),
      resx.getGroundTypes(groundTypesStream),
      resx.getObjects(objectsStream),
    ]);
    Logger.log('Updater', 'Updated assets!', LogLevel.Success);
    this.env.updateJSON<Versions>({ assetVersion }, 'versions.json');
  }

  /**
   * Updates the packets.json file and the client version
   * by downloading the latest client and extracting the info.
   */
  private async updateClient(): Promise<void> {
    Logger.log('Updater', 'Fetching client version...', LogLevel.Info);
    const version = await resx.getClientVersion();
    Logger.log('Updater', 'Downloading client...', LogLevel.Info);
    const clientBuffer = await resx.getClient(version);

    const extractor = new resx.Extractor(clientBuffer);
    Logger.log('Updater', 'Extracting packets...', LogLevel.Info);
    const packets = extractor.packets();
    Logger.log('Updater', 'Extracting parameters...', LogLevel.Info);
    const params = extractor.parameters();
    extractor.free();

    this.env.writeJSON(packets, 'packets.json');
    this.env.updateJSON<Versions>({
      clientVersion: version,
      buildVersion: params.version,
    }, 'versions.json');
    Logger.log('Updater', 'Updated packets and version!', LogLevel.Success);
  }
}
