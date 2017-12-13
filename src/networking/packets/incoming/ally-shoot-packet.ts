import { Packet, PacketType } from '../../packet';

export class AllyShootPacket extends Packet {

    public type = PacketType.ALLYSHOOT;

    //#region packet-specific members
    bulletId: number;
    ownerId: number;
    containerType: number;
    angle: number;
    //#endregion

    public read(): void {
        this.bulletId = this.readUnsignedByte();
        this.ownerId = this.readInt32();
        this.containerType = this.readShort();
        this.angle = this.readFloat();
    }

    public write(): void {
        this.writeUnsigedByte(this.bulletId);
        this.writeInt32(this.ownerId);
        this.writeShort(this.containerType);
        this.writeFloat(this.angle);
    }
}
