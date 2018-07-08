import { Packet, PacketType } from '../../packet';

export class TradeRequestedPacket extends Packet {

    type = PacketType.TRADEREQUESTED;

    //#region packet-specific members
    name: string;
    //#endregion

    read(): void {
        this.name = this.readString();
    }

    write(): void {
        this.writeString(this.name);
    }
}
