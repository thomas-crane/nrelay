import { Packet, PacketType } from '../../../packet';

export class EnterArenaPacket extends Packet {

    public type = PacketType.ENTERARENA;

    //#region packet-specific members
    currency: number;
    //#endregion

    public read(): void {
        this.currency = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.currency);
    }
}
