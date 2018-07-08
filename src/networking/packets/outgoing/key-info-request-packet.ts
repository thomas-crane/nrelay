import { Packet, PacketType } from '../../packet';

export class KeyInfoRequestPacket extends Packet {

    type = PacketType.KEYINFO_REQUEST;

    //#region packet-specific members
    itemType: number;
    //#endregion

    read(): void {
        this.itemType = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.itemType);
    }
}
