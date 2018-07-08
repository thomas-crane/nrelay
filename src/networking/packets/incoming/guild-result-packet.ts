import { Packet, PacketType } from '../../packet';

export class GuildResultPacket extends Packet {

    type = PacketType.GUILDRESULT;

    //#region packet-specific members
    success: boolean;
    lineBuilderJSON: string;
    //#endregion

    read(): void {
        this.success = this.readBoolean();
        this.lineBuilderJSON = this.readString();
    }

    write(): void {
        this.writeBoolean(this.success);
        this.writeString(this.lineBuilderJSON);
    }
}
