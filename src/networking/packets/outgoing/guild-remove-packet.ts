import { Packet, PacketType } from '../../packet';

export class GuildRemovePacket extends Packet {

    type = PacketType.GUILDREMOVE;

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
