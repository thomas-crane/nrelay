import { Packet, PacketType } from '../../packet';

export class InvitedToGuildPacket extends Packet {

    type = PacketType.INVITEDTOGUILD;

    //#region packet-specific members
    name: string;
    guildName: string;
    //#endregion

    read(): void {
        this.name = this.readString();
        this.guildName = this.readString();
    }

    write(): void {
        this.writeString(this.name);
        this.writeString(this.guildName);
    }
}
