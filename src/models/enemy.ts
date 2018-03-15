import { IObject } from './object';
import { ObjectStatusData } from '../networking/data/object-status-data';
import { StatData } from '../networking/data/stat-data';
import { IPlayerData } from './playerdata';

export class Enemy {
    objectData: IPlayerData;
    properties: IObject;
    dead: boolean;
    lastUpdate: number;

    constructor(properties: IObject) {
        this.properties = properties;
        this.dead = false;
    }

    public update(objectStatus: ObjectStatusData): void {
        this.objectData = ObjectStatusData.processObjectStatus(objectStatus, this.objectData);
        this.lastUpdate = Date.now();
    }

    public damage(damage: number): number {
        const min = damage * 3 / 20;
        const actualDamge = Math.max(min, damage - this.objectData.def);
        return actualDamge;
    }
}
