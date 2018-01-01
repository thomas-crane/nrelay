import { Packet } from './../packet';

export class WorldPosData {

    x: number;
    y: number;

    public read(packet: Packet): void {
        this.x = packet.readFloat();
        this.y = packet.readFloat();
    }

    public write(packet: Packet): void {
        packet.writeFloat(this.x);
        packet.writeFloat(this.y);
    }

    public squareDistanceTo(location: WorldPosData): number {
        const a = location.x - this.x;
        const b = location.y - this.y;
        return a ** 2 + b ** 2;
    }

    public clone(): WorldPosData {
        const clone = new WorldPosData();
        clone.x = this.x;
        clone.y = this.y;
        return clone;
    }
}
