import { Packet, PacketType } from '../../packet';

export class CreateGuildPacket extends Packet {

    type = PacketType.CREATEGUILD;

    //#region packet-specific members
    name: string;
    //#endregion

    read(): void {
        this.name = this.readString();
    }

    write(): void {
        this.writeString(this.name);
    }
}
