/**
 * @module models
 */
import { Proxy } from './proxy';
/**
 * A list of `Account`s and configuration settings used by nrelay at startup time.
 */
export interface AccountInfo {
  buildVersion: string;
  localServer?: LocalServerSettings;
  accounts: Account[];
}
/**
 * An account which can be used to connect to the game with.
 */
export interface Account {
  alias: string;
  guid: string;
  password: string;
  serverPref: string;
  charInfo?: CharacterInfo;
  proxy?: Proxy;
  pathfinder?: boolean;
}

/**
 * The character information of an `Account`.
 */
export interface CharacterInfo {
  charId: number;
  nextCharId: number;
  maxNumChars: number;
}

/**
 * Configuration settings for the local server.
 */
export interface LocalServerSettings {
  enabled: boolean;
  port?: number;
}
