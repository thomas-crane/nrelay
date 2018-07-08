import { Packet, PacketType } from '../../packet';

export class GuildInvitePacket extends Packet {

    type = PacketType.GUILDINVITE;

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
