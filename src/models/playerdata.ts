import { WorldPosData } from './../networking/data/world-pos-data';

export interface IPlayerData {
    objectId: number;
    worldPos: WorldPosData;
    name: string;
    level: number;
    exp: number;
    currentFame: number;
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
    hpPots: number;
    mpPots: number;
    hasBackpack: boolean;
    inventory: number[];
    /**
     * @deprecated Use `Client.server` instead.
     * This is not gauranteed to be correct.
     */
    server: string;
}

export function getDefaultPlayerData(): IPlayerData {
    return {
        objectId: 0,
        worldPos: null,
        name: '',
        level: 0,
        exp: 0,
        currentFame: 0,
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
        hpPots: 0,
        mpPots: 0,
        hasBackpack: false,
        inventory: new Array<number>(20).fill(-1),
        server: ''
    };
}
