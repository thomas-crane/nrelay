import { Packet, PacketType } from '../../packet';

export class ReconnectPacket extends Packet {

    public type = PacketType.RECONNECT;

    //#region packet-specific members
    name: string;
    host: string;
    stats: string;
    port: number;
    gameId: number;
    keyTime: number;
    key: Int8Array;
    isFromArena: boolean;
    //#endregion

    public read(): void {
        this.name = this.readString();
        this.host = this.readString();
        this.stats = this.readString();
        this.port = this.readInt32();
        this.gameId = this.readInt32();
        this.keyTime = this.readInt32();
        this.isFromArena = this.readBoolean();
        const keyLen = this.readShort();
        this.key = new Int8Array(keyLen);
        for (let i = 0; i < keyLen; i++) {
            this.key[i] = this.readByte();
        }
    }

    public write(): void {
        this.writeString(this.name);
        this.writeString(this.host);
        this.writeString(this.stats);
        this.writeInt32(this.port);
        this.writeInt32(this.gameId);
        this.writeInt32(this.keyTime);
        this.writeBoolean(this.isFromArena);
        this.writeShort(this.key.length);
        for (let i = 0; i < this.key.length; i++) {
            this.writeByte(this.key[i]);
        }
    }
}
