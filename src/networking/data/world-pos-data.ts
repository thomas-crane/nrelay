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
}
