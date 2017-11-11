import { Packet } from './../packet';

export class TradeItem {

    item: number;
    slotType: number;
    tradeable: boolean;
    included: boolean;

    public read(packet: Packet): void {
        this.item = packet.readInt32();
        this.slotType = packet.readInt32();
        this.tradeable = packet.readBoolean();
        this.included = packet.readBoolean();
    }

    public write(packet: Packet): void {
        packet.writeInt32(this.item);
        packet.writeInt32(this.slotType);
        packet.writeBoolean(this.tradeable);
        packet.writeBoolean(this.included);
    }
}
