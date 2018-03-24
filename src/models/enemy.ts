import { IObject } from './object';
import { ObjectStatusData } from '../networking/data/object-status-data';
import { StatData } from '../networking/data/stat-data';
import { IPlayerData } from './playerdata';
import { IPoint } from '../services/pathfinding/point';
import { WorldPosData } from '../networking/data/world-pos-data';

export class Enemy {
    objectData: IPlayerData;
    properties: IObject;
    dead: boolean;
    lastUpdate: number;
    tickPos: IPoint;
    posAtTick: IPoint;
    moveVector: IPoint;
    lastTickId: number;
    currentPos: IPoint;

    constructor(properties: IObject, status: ObjectStatusData) {
        this.properties = properties;
        this.objectData = ObjectStatusData.processObjectStatus(status);
        this.dead = false;
        this.lastUpdate = 0;
        this.lastTickId = -1;
        this.currentPos = status.pos.toPrecisePoint();
        this.tickPos = {
            x: this.currentPos.x,
            y: this.currentPos.y
        };
        this.posAtTick = {
            x: this.currentPos.x,
            y: this.currentPos.y
        };
        this.moveVector = {
            x: 0,
            y: 0
        };
    }

    public onNewTick(objectStatus: ObjectStatusData, tickTime: number, tickId: number, clientTime: number): void {
        this.objectData = ObjectStatusData.processObjectStatus(objectStatus, this.objectData);
        if (this.lastTickId < tickId) {
            this.moveTo(this.tickPos.x, this.tickPos.y);
        }
        this.lastUpdate = clientTime;
        this.tickPos.x = objectStatus.pos.x;
        this.tickPos.y = objectStatus.pos.y;
        this.posAtTick.x = this.currentPos.x;
        this.posAtTick.y = this.currentPos.y;
        this.moveVector = {
            x: (this.tickPos.x - this.posAtTick.x) / tickTime,
            y: (this.tickPos.y - this.posAtTick.y) / tickTime
        };
        this.lastTickId = tickId;
        this.lastUpdate = clientTime;
    }

    public squareDistanceTo(point: IPoint | WorldPosData): number {
        const a = point.x - this.currentPos.x;
        const b = point.y - this.currentPos.y;
        return a ** 2 + b ** 2;
    }

    public damage(damage: number): number {
        const min = damage * 3 / 20;
        const actualDamge = Math.max(min, damage - this.objectData.def);
        return actualDamge;
    }

    public frameTick(lastTick: number, clientTime: number): void {
        if (!(this.moveVector.x === 0 && this.moveVector.y === 0)) {
            if (this.lastTickId < lastTick) {
                this.moveVector.x = 0;
                this.moveVector.y = 0;
                this.moveTo(this.tickPos.x, this.tickPos.y);
            } else {
                const time = clientTime - this.lastUpdate;
                const dX = this.posAtTick.x + time * this.moveVector.x;
                const dY = this.posAtTick.y + time * this.moveVector.y;
                this.moveTo(dX, dY);
            }
        }
    }

    public onGoto(x: number, y: number, time: number): void {
        this.moveTo(x, y);
        this.tickPos.x = x;
        this.tickPos.y = y;
        this.posAtTick.x = x;
        this.posAtTick.y = y;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.lastUpdate = time;
    }

    private moveTo(x: number, y: number): void {
        this.currentPos.x = x;
        this.currentPos.y = y;
    }
}
