import { Packet, PacketType } from '../../packet';

export class CancelTradePacket extends Packet {

    public type = PacketType.CANCELTRADE;

    //#region packet-specific members
    /**
     * @deprecated This is not written to the packet when sending.
     */
    objectId: number;
    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
