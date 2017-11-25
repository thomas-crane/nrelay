import { Packet, PacketType } from '../../packet';

export class TradeRequestedPacket extends Packet {

    public type = PacketType.TRADEREQUESTED;

    //#region packet-specific members
    name: string;
    //#endregion

    public read(): void {
        this.name = this.readString();
    }

    public write(): void {
        this.writeString(this.name);
    }
}
