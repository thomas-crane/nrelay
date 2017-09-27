import { IServer } from '../models/server';

const SERVER_REGEX = /<Server><Name>(\w+)<\/Name><DNS>(\d+\.\d+\.\d+\.\d+)<\/DNS>/g;

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
