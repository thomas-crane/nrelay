import { Packet, PacketType } from '../../packet';

export class LoadPacket extends Packet {

    public type = PacketType.LOAD;

    //#region packet-specific members
    charId: number;
    isFromArena: boolean;
    //#endregion

    public read(): void {
        this.charId = this.readInt32();
        this.isFromArena = this.readBoolean();
    }

    public write(): void {
        this.writeInt32(this.charId);
        this.writeBoolean(this.isFromArena);
    }
}
