export interface IAccountInfo {
    buildVersion: string;
    accounts: IAccount[];
}
export interface IAccount {
    guid: string;
    password: string;
    serverPref: string;
    charId: number;
    nextCharId: number;
    maxNumChars: number;
}
