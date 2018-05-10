import { IServer, IAccount, ICharacterInfo } from './../models';

const SERVER_REGEX = /<Server><Name>(\w+)<\/Name><DNS>(\d+\.\d+\.\d+\.\d+)<\/DNS>/g;

const ACCOUNT_INFO_REGEX = /<Chars nextCharId="(\d+)" maxNumChars="(\d+)">(?:<Char id="(\d+)">)*/;

const ERROR_REGEX = /<Error\/?>(.+)<\/?Error>/;

export class XMLtoJSON {

}

export function parseServers(xml: string): { [id: string]: IServer } {
    let match = SERVER_REGEX.exec(xml);
    const servers = {} as { [id: string]: IServer };
    while (match != null) {
        const name = match[1];
        const ip = match[2];
        servers[name] = {
            name: name,
            address: ip
        };
        match = SERVER_REGEX.exec(xml);
    }
    return servers;
}

export function parseAccountInfo(xml: string): ICharacterInfo | null {
    const acc = {
        nextCharId: 2,
        charId: 1,
        maxNumChars: 1
    };
    const match = ACCOUNT_INFO_REGEX.exec(xml);
    if (match != null) {
        acc.nextCharId = +match[1];
        acc.maxNumChars = +match[2];
        try {
            acc.charId = +match[3];
        } catch {
            acc.charId = -1;
        }
    } else {
        return null;
    }
    return acc;
}

export function parseError(xml: string): Error {
    const match = ERROR_REGEX.exec(xml);
    if (match) {
        return new Error(match[1]);
    }
    return null;
}
