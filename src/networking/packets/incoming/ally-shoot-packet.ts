import { Packet, PacketType } from '../../packet';

export class AllyShootPacket extends Packet {

    type = PacketType.ALLYSHOOT;

    //#region packet-specific members
    bulletId: number;
    ownerId: number;
    containerType: number;
    angle: number;
    //#endregion

    read(): void {
        this.bulletId = this.readUnsignedByte();
        this.ownerId = this.readInt32();
        this.containerType = this.readShort();
        this.angle = this.readFloat();
    }

    write(): void {
        this.writeUnsignedByte(this.bulletId);
        this.writeInt32(this.ownerId);
        this.writeShort(this.containerType);
        this.writeFloat(this.angle);
    }
}
