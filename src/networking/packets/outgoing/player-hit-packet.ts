import { Packet, PacketType } from '../../packet';

export class PlayerHitPacket extends Packet {

    public type = PacketType.PLAYERHIT;

    //#region packet-specific members
    bulletId: number;
    objectId: number;
    //#endregion

    public read(): void {
        this.bulletId = this.readByte();
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeByte(this.bulletId);
        this.writeInt32(this.objectId);
    }
}
