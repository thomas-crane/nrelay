import { Server, CharacterInfo } from './../models';

const SERVER_REGEX = /<Server><Name>(\w+)<\/Name><DNS>(\d+\.\d+\.\d+\.\d+)<\/DNS>/g;

const ACCOUNT_INFO_REGEX = /<Chars nextCharId="(\d+)" maxNumChars="(\d+)">(?:<Char id="(\d+)">)*/;

export class XMLtoJSON {
  static parseServers(xml: string): { [id: string]: Server } {
    let match = SERVER_REGEX.exec(xml);
    const servers = {} as { [id: string]: Server };
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

  static parseAccountInfo(xml: string): CharacterInfo {
    const acc = {
      nextCharId: 2,
      charId: 1,
      maxNumChars: 1
    };
    const match = ACCOUNT_INFO_REGEX.exec(xml);
    if (match) {
      acc.nextCharId = +match[1];
      acc.maxNumChars = +match[2];
      if (match[3]) {
        acc.charId = +match[3];
      } else {
        acc.charId = -1;
      }
    } else {
      return null;
    }
    return acc;
  }
}
