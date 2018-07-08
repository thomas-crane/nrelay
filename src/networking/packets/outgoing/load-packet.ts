import { Packet, PacketType } from '../../packet';

export class LoadPacket extends Packet {

    type = PacketType.LOAD;

    //#region packet-specific members
    charId: number;
    isFromArena: boolean;
    //#endregion

    read(): void {
        this.charId = this.readInt32();
        this.isFromArena = this.readBoolean();
    }

    write(): void {
        this.writeInt32(this.charId);
        this.writeBoolean(this.isFromArena);
    }
}
