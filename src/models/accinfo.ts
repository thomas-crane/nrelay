import { IProxy } from './proxy';

export interface IAccountInfo {
    buildVersion: string;
    localServer?: ILocalServerSettings;
    accounts: IAccount[];
}
export interface IAccount {
    alias: string;
    guid: string;
    password: string;
    serverPref: string;
    charInfo?: ICharacterInfo;
    proxy?: IProxy;
    pathfinder?: boolean;
}

export interface ICharacterInfo {
    charId: number;
    nextCharId: number;
    maxNumChars: number;
}

export interface ILocalServerSettings {
    enabled: boolean;
    port?: number;
}
