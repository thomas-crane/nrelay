import { Packet, PacketType } from '../../packet';

export class PlayerHitPacket extends Packet {

    type = PacketType.PLAYERHIT;

    //#region packet-specific members
    bulletId: number;
    objectId: number;
    //#endregion

    read(): void {
        this.bulletId = this.readUnsignedByte();
        this.objectId = this.readInt32();
    }

    write(): void {
        this.writeUnsignedByte(this.bulletId);
        this.writeInt32(this.objectId);
    }
}
