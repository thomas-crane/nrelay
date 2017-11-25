import { Packet, PacketType } from '../../packet';

export class RequestTradePacket extends Packet {

    public type = PacketType.REQUESTTRADE;

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
