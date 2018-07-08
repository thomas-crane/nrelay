import { Packet, PacketType } from '../../packet';

export class OtherHitPacket extends Packet {

    type = PacketType.OTHERHIT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    objectId: number;
    targetId: number;
    //#endregion

    read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.objectId = this.readInt32();
        this.targetId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeInt32(this.objectId);
        this.writeInt32(this.targetId);
    }
}
