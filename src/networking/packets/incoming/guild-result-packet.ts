import { Packet, PacketType } from '../../packet';

export class GuildResultPacket extends Packet {

    public type = PacketType.GUILDRESULT;

    //#region packet-specific members
    success: boolean;
    lineBuilderJSON: string;
    //#endregion

    public read(): void {
        this.success = this.readBoolean();
        this.lineBuilderJSON = this.readString();
    }

    public write(): void {
        this.writeBoolean(this.success);
        this.writeString(this.lineBuilderJSON);
    }
}
