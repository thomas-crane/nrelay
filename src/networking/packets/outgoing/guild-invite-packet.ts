import { Packet, PacketType } from '../../packet';

export class GuildInvitePacket extends Packet {

    public type = PacketType.GUILDINVITE;

    //#region packet-specific members
    name: string;
    //#endregion

    public read(): void {
        this.name = this.readString();
    }

    public write(): void {
        this.writeString(this.name);
    }
}
