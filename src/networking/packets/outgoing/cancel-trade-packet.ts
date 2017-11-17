import { Packet, PacketType } from '../../packet';

export class CancelTradePacket extends Packet {

    public type = PacketType.CancelTrade;

    //#region packet-specific members
    objectId: number;
    //#endregion

    public read(): void {
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.objectId);
    }
}
