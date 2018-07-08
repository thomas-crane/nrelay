import { Packet, PacketType } from '../../packet';

export class RequestTradePacket extends Packet {

    type = PacketType.REQUESTTRADE;

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
