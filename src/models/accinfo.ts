import { Proxy } from './proxy';

export interface AccountInfo {
  buildVersion: string;
  localServer?: LocalServerSettings;
  accounts: Account[];
}
export interface Account {
  alias: string;
  guid: string;
  password: string;
  serverPref: string;
  charInfo?: CharacterInfo;
  proxy?: Proxy;
  pathfinder?: boolean;
}

export interface CharacterInfo {
  charId: number;
  nextCharId: number;
  maxNumChars: number;
}

export interface LocalServerSettings {
  enabled: boolean;
  port?: number;
}
