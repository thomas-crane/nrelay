import { Packet, PacketType } from '../../packet';

export class JoinGuildPacket extends Packet {

    type = PacketType.JOINGUILD;

    //#region packet-specific members
    guildName: string;
    //#endregion

    read(): void {
        this.guildName = this.readString();
    }

    write(): void {
        this.writeString(this.guildName);
    }
}
