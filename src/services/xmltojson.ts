import { IServer } from './../models/server';

const SERVER_REGEX = /<Server><Name>(\w+)<\/Name><DNS>(\d+\.\d+\.\d+\.\d+)<\/DNS>/g;

const ACCOUNT_INFO_REGEX = /<Chars nextCharId="(\d+)" maxNumChars="(\d+)"><Char id="(\d+)">/g;

export class XMLtoJSON {

}

export function parseServers(xml: string): IServer[] {
    let match = SERVER_REGEX.exec(xml);
    const servers = [];
    while (match != null) {
        const name = match[1];
        const ip = match[2];
        servers.push({
            name: name,
            address: ip
        });
        match = SERVER_REGEX.exec(xml);
    }
    return servers;
}

export function parseAccountInfo(xml: string): { nextCharId: number, charId: number, maxNumChars: number } | null {
    const info = {
        nextCharId: 2,
        charId: 1,
        maxNumChars: 1,
    };
    const match = ACCOUNT_INFO_REGEX.exec(xml);
    if (match != null) {
        info.nextCharId = +match[1];
        info.maxNumChars = +match[2];
        info.charId = +match[3];
    } else {
        return null;
    }
    return info;
}
