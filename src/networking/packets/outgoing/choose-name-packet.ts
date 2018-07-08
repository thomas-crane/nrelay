import { Packet, PacketType } from '../../packet';

export class ChooseNamePacket extends Packet {

    type = PacketType.CHOOSENAME;

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
