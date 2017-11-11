import { Packet, PacketType } from '../../packet';

export class CancelTradePacket extends Packet {

    public type = PacketType.CancelTrade;

    //#region packet-specific members
    objectId: number;
    //#endregion

    public read(): void {
    }

    public write(): void {

    }
}
