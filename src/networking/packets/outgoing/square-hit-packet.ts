import { Packet, PacketType } from '../../packet';

export class SquareHitPacket extends Packet {

    public type = PacketType.SQUAREHIT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    objectId: number;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeInt32(this.objectId);
    }
}
