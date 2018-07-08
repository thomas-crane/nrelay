import { Packet, PacketType } from '../../packet';

export class ChangeGuildRankPacket extends Packet {

    type = PacketType.CHANGEGUILDRANK;

    //#region packet-specific members
    name: string;
    guildRank: number;
    //#endregion

    read(): void {
        this.name = this.readString();
        this.guildRank = this.readInt32();
    }

    write(): void {
        this.writeString(this.name);
        this.writeInt32(this.guildRank);
    }
}
