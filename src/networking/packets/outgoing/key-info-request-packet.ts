import { Packet, PacketType } from '../../packet';

export class KeyInfoRequestPacket extends Packet {

    public type = PacketType.KEYINFO_REQUEST;

    //#region packet-specific members
    itemType: number;
    //#endregion

    public read(): void {
        this.itemType = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.itemType);
    }
}
