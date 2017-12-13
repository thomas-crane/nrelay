import { Packet, PacketType } from '../../packet';

export class KeyInfoResponsePacket extends Packet {

    public type = PacketType.KEYINFO_RESPONSE;

    //#region packet-specific members
    name: string;
    description: string;
    creator: string;
    //#endregion

    public read(): void {
        this.name = this.readString();
        this.description = this.readString();
        this.creator = this.readString();
    }

    public write(): void {
        this.writeString(this.name);
        this.writeString(this.description);
        this.writeString(this.creator);
    }
}
