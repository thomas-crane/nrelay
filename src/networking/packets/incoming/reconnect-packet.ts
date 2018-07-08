import { Packet, PacketType } from '../../packet';

export class ReconnectPacket extends Packet {

    type = PacketType.RECONNECT;

    //#region packet-specific members
    name: string;
    host: string;
    stats: string;
    port: number;
    gameId: number;
    keyTime: number;
    key: number[];
    isFromArena: boolean;
    //#endregion

    read(): void {
        this.name = this.readString();
        this.host = this.readString();
        this.stats = this.readString();
        this.port = this.readInt32();
        this.gameId = this.readInt32();
        this.keyTime = this.readInt32();
        this.isFromArena = this.readBoolean();
        this.key = this.readByteArray();
    }

    write(): void {
        this.writeString(this.name);
        this.writeString(this.host);
        this.writeString(this.stats);
        this.writeInt32(this.port);
        this.writeInt32(this.gameId);
        this.writeInt32(this.keyTime);
        this.writeBoolean(this.isFromArena);
        this.writeByteArray(this.key);
    }
}
