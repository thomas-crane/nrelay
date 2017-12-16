import { Packet, PacketType } from '../../packet';

export class JoinGuildPacket extends Packet {

    public type = PacketType.JOINGUILD;

    //#region packet-specific members
    guildName: string;
    //#endregion

    public read(): void {
        this.guildName = this.readString();
    }

    public write(): void {
        this.writeString(this.guildName);
    }
}
