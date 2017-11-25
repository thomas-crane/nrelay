import { Packet, PacketType } from '../../packet';
import { TradeItem } from './../../data/trade-item';

export class TradeStartPacket extends Packet {

    public type = PacketType.TRADESTART;

    //#region packet-specific members
    clientItems: TradeItem[];
    partnerName: string;
    partnerItems: TradeItem[];
    //#endregion

    public read(): void {
        const clientItemsLen = this.readShort();
        this.clientItems = new Array(clientItemsLen);
        for (let i = 0; i < clientItemsLen; i++) {
            const item = new TradeItem();
            item.read(this);
            this.clientItems[i] = item;
        }
        this.partnerName = this.readString();
        const partnerItemsLen = this.readShort();
        this.partnerItems = new Array(partnerItemsLen);
        for (let i = 0; i < partnerItemsLen; i++) {
            const item = new TradeItem();
            item.read(this);
            this.partnerItems[i] = item;
        }
    }

    public write(): void {
        this.writeShort(this.clientItems.length);
        for (let i = 0; i < this.clientItems.length; i++) {
            const item = new TradeItem();
            item.write(this);
        }
        this.writeString(this.partnerName);
        this.writeShort(this.partnerItems.length);
        for (let i = 0; i < this.partnerItems.length; i++) {
            const item = new TradeItem();
            item.write(this);
        }
    }
}
