import { Packet, PacketType } from '../../packet';

export class ChangeGuildRankPacket extends Packet {

    public type = PacketType.CHANGEGUILDRANK;

    //#region packet-specific members
    name: string;
    guildRank: number;
    //#endregion

    public read(): void {
        this.name = this.readString();
        this.guildRank = this.readInt32();
    }

    public write(): void {
        this.writeString(this.name);
        this.writeInt32(this.guildRank);
    }
}
