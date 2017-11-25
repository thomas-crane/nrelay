import { Packet, PacketType } from '../../packet';

export class CreatePacket extends Packet {

    public type = PacketType.CREATE;

    //#region packet-specific members
    classType: number;
    skinType: number;
    //#endregion

    public read(): void {
        this.classType = this.readShort();
        this.skinType = this.readShort();
    }

    public write(): void {
        this.writeShort(this.classType);
        this.writeShort(this.skinType);
    }
}
