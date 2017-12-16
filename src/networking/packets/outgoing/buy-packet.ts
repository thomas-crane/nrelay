import { Packet, PacketType } from '../../packet';

export class BuyPacket extends Packet {

    public type = PacketType.BUY;

    //#region packet-specific members
    objectId: number;
    quantity: number;
    //#endregion

    public read(): void {
        this.objectId = this.readInt32();
        this.quantity = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.objectId);
        this.writeInt32(this.quantity);
    }
}
