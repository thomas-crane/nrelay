import { Packet, PacketType } from '../../packet';

export class SquareHitPacket extends Packet {

    type = PacketType.SQUAREHIT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    objectId: number;
    //#endregion

    read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.objectId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeInt32(this.objectId);
    }
}
