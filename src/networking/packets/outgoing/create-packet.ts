import { Packet, PacketType } from '../../packet';

export class CreatePacket extends Packet {

    type = PacketType.CREATE;

    //#region packet-specific members
    classType: number;
    skinType: number;
    //#endregion

    read(): void {
        this.classType = this.readShort();
        this.skinType = this.readShort();
    }

    write(): void {
        this.writeShort(this.classType);
        this.writeShort(this.skinType);
    }
}
