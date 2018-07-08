import { Packet } from './../packet';
import { IPoint } from '../../services/pathfinding/point';

export class WorldPosData {

    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        this.x = x || null;
        this.y = y || null;
    }

    read(packet: Packet): void {
        this.x = packet.readFloat();
        this.y = packet.readFloat();
    }

    write(packet: Packet): void {
        packet.writeFloat(this.x);
        packet.writeFloat(this.y);
    }

    squareDistanceTo(location: WorldPosData | IPoint): number {
        const a = location.x - this.x;
        const b = location.y - this.y;
        return a ** 2 + b ** 2;
    }

    clone(): WorldPosData {
        const clone = new WorldPosData();
        clone.x = this.x;
        clone.y = this.y;
        return clone;
    }

    toPrecisePoint(): IPoint {
        return {
            x: this.x,
            y: this.y
        };
    }

    toPoint(): IPoint {
        return {
            x: Math.floor(this.x),
            y: Math.floor(this.y)
        };
    }
}
