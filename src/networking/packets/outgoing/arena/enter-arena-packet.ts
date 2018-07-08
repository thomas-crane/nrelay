import { Packet, PacketType } from '../../../packet';

export class EnterArenaPacket extends Packet {

    type = PacketType.ENTERARENA;

    //#region packet-specific members
    currency: number;
    //#endregion

    read(): void {
        this.currency = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.currency);
    }
}
