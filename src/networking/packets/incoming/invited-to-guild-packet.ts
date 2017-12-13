import { Packet, PacketType } from '../../packet';

export class InvitedToGuildPacket extends Packet {

    public type = PacketType.INVITEDTOGUILD;

    //#region packet-specific members
    name: string;
    guildName: string;
    //#endregion

    public read(): void {
        this.name = this.readString();
        this.guildName = this.readString();
    }

    public write(): void {
        this.writeString(this.name);
        this.writeString(this.guildName);
    }
}
