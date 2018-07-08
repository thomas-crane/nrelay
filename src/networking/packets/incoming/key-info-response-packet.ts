import { Packet, PacketType } from '../../packet';

export class KeyInfoResponsePacket extends Packet {

    type = PacketType.KEYINFO_RESPONSE;

    //#region packet-specific members
    name: string;
    description: string;
    creator: string;
    //#endregion

    read(): void {
        this.name = this.readString();
        this.description = this.readString();
        this.creator = this.readString();
    }

    write(): void {
        this.writeString(this.name);
        this.writeString(this.description);
        this.writeString(this.creator);
    }
}
