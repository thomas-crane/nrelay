import { WorldPosData } from './../networking/data/world-pos-data';
import { Classes } from './classes';
import { GuildRank } from './guildrank';

export interface IPlayerData {
    objectId: number;
    worldPos: WorldPosData;
    name: string;
    level: number;
    exp: number;
    currentFame: number;
    stars: number;
    accountId: string;
    accountFame: number;
    nameChosen: boolean;
    guildName: string;
    guildRank: GuildRank;
    gold: number;
    class: Classes;
    maxHP: number;
    maxMP: number;
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
    dex: number;
    wis: number;
    vit: number;
    condition: number;
    hpPots: number;
    mpPots: number;
    hasBackpack: boolean;
    inventory: number[];
    /**
     * @deprecated To get the server of a connect client, use `Client.server` instead.
     * for any other use (such as the Player Tracker) using this is fine.
     */
    server: string;
}

export function getDefaultPlayerData(): IPlayerData {
    return {
        objectId: 0,
        worldPos: null,
        name: null,
        level: 0,
        exp: 0,
        currentFame: 0,
        stars: 0,
        accountId: null,
        accountFame: 0,
        gold: 0,
        class: Classes.Wizard,
        nameChosen: false,
        guildName: null,
        guildRank: GuildRank.NoRank,
        maxHP: 0,
        maxMP: 0,
        hp: 0,
        mp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        dex: 0,
        wis: 0,
        vit: 0,
        condition: 0,
        hpPots: 0,
        mpPots: 0,
        hasBackpack: false,
        inventory: new Array<number>(20).fill(-1),
        server: null
    };
}
