import { Packet } from './../packet';

export class GroundTileData {

    x: number;
    y: number;
    type: number;

    read(packet: Packet): void {
        this.x = packet.readShort();
        this.y = packet.readShort();
        this.type = packet.readUnsignedShort();
    }

    write(packet: Packet): void {
        packet.writeShort(this.x);
        packet.writeShort(this.y);
        packet.writeUnsignedShort(this.type);
    }
}
