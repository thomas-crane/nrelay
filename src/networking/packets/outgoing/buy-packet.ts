import { Packet, PacketType } from '../../packet';

export class BuyPacket extends Packet {

    type = PacketType.BUY;

    //#region packet-specific members
    objectId: number;
    quantity: number;
    //#endregion

    read(): void {
        this.objectId = this.readInt32();
        this.quantity = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.objectId);
        this.writeInt32(this.quantity);
    }
}
