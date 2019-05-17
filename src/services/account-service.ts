import * as dns from 'dns';
import * as net from 'net';
import { Logger, LogLevel } from '../core';
import { CharacterInfo, Proxy, SERVER_ENDPOINT } from '../models';
import { AccountInUseError } from '../models/account-in-use-error';
import { Environment } from '../runtime/environment';
import { ServerList } from '../runtime/server-list';
import { HttpClient } from './http';
import * as xmlToJSON from './xmltojson';

const ACCOUNT_IN_USE_REGEX = /Account in use \((\d+) seconds? until timeout\)/;
const ERROR_REGEX = /<Error\/?>(.+)<\/?Error>/;

interface CharInfoCache {
  [guid: string]: CharacterInfo;
}

export class AccountService {
  constructor(readonly env: Environment) { }

  /**
   * Gets the list of servers available to connect to. This will
   * look in the cache first and will only make a web request if
   * the cache does not exist.
   */
  getServerList(): Promise<ServerList> {
    Logger.log('AccountService', 'Loading server list...', LogLevel.Info);
    const cachedServerList = this.env.readJSON<ServerList>('servers.cache.json');
    if (cachedServerList) {
      Logger.log('AccountService', 'Cached server list loaded!', LogLevel.Success);
      return Promise.resolve(cachedServerList);
    } else {
      // if there is no cache, fetch the servers.
      return HttpClient.get(SERVER_ENDPOINT).then((response) => {
        // check for errors.
        const maybeError = this.getError(response);
        if (maybeError) {
          throw maybeError;
        } else {
          const servers: ServerList = xmlToJSON.parseServers(response);
          Logger.log('AccountService', 'Server list loaded!', LogLevel.Success);
          // update the cache.
          this.env.writeJSON(servers, 'servers.cache.json');
          return servers;
        }
      });
    }
  }

  /**
   * Gets the character info for the account with the guid/password provided.
   * This will look in the cache first, and it will only request the info
   * from the rotmg server if the char info was not found in the cache.
   * @param guid The guid of the account to get the character info of.
   * @param password The password of the account to get the character info of.
   * @param proxy An optional proxy to use when making the request.
   */
  getCharacterInfo(guid: string, password: string, proxy?: Proxy): Promise<CharacterInfo> {
    // look in the cache.
    Logger.log('AccountService', 'Loading character info...', LogLevel.Info);
    const cachedCharInfo = this.env.readJSON<CharInfoCache>('char-info.cache.json');
    if (cachedCharInfo && cachedCharInfo.hasOwnProperty(guid)) {
      Logger.log('AccountService', 'Cached character info loaded!', LogLevel.Success);
      return Promise.resolve(cachedCharInfo[guid]);
    } else {
      // if there is no cache, fetch the info.
      return HttpClient.get(SERVER_ENDPOINT, {
        proxy,
        query: {
          guid, password,
        },
      }).then((response) => {
        // check for errors.
        const maybeError = this.getError(response);
        if (maybeError) {
          throw maybeError;
        }
        const charInfo = xmlToJSON.parseAccountInfo(response);
        Logger.log('AccountService', 'Character info loaded!', LogLevel.Success);
        // update the cache.
        const cacheUpdate: CharInfoCache = {};
        cacheUpdate[guid] = charInfo;
        this.env.updateJSON(cacheUpdate, 'char-info.cache.json');
        return charInfo;
      });
    }
  }

  /**
   * Updates the cached character info for the account with the `guid`.
   * @param guid The guid of the account to update the cache of.
   * @param charInfo The new info to store in the cache.
   */
  updateCharInfoCache(guid: string, charInfo: CharacterInfo): void {
    const cacheUpdate: CharInfoCache = {};
    cacheUpdate[guid] = charInfo;
    this.env.updateJSON(cacheUpdate, 'char-info.cache.json');
    Logger.log('AccountService', 'Character info cache updated!', LogLevel.Success);
  }

  /**
   * Resolves a proxy hostname to ensure its `host` field
   * is always an IP instead of possibly a hostname.
   * @param proxy The proxy to resolve the hostname of.
   */
  resolveProxyHostname(proxy: Proxy): Promise<void> {
    if (net.isIP(proxy.host) === 0) {
      Logger.log('AccountService', 'Resolving proxy hostname.', LogLevel.Info);
      return new Promise((resolve, reject) => {
        dns.lookup(proxy.host, (err, address) => {
          if (err) {
            reject(err);
            return;
          }
          Logger.log('AccountService', 'Proxy hostname resolved!', LogLevel.Success);
          proxy.host = address;
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  private getError(response: string): Error {
    // check for acc in use.
    const accInUse = ACCOUNT_IN_USE_REGEX.exec(response);
    if (accInUse) {
      const error = new AccountInUseError(parseInt(accInUse[1], 10));
      return error;
    }
    // check for the generic <Error>some error</Error>
    const otherError = ERROR_REGEX.exec(response);
    if (otherError) {
      const error = new Error(otherError[1]);
      error.name = 'OTHER_ERROR';
      return error;
    }

    // no errors.
    return undefined;
  }
}
