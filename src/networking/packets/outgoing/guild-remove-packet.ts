import { Packet, PacketType } from '../../packet';

export class GuildRemovePacket extends Packet {

    public type = PacketType.GUILDREMOVE;

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
