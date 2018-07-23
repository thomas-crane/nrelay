import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { TradeItem } from '../../data/trade-item';

export class TradeStartPacket implements IncomingPacket {

  type = PacketType.TRADESTART;

  //#region packet-specific members
  clientItems: TradeItem[];
  partnerName: string;
  partnerItems: TradeItem[];
  //#endregion

  read(buffer: PacketBuffer): void {
    const clientItemsLen = buffer.readShort();
    this.clientItems = new Array(clientItemsLen);
    for (let i = 0; i < clientItemsLen; i++) {
      const item = new TradeItem();
      item.read(buffer);
      this.clientItems[i] = item;
    }
    this.partnerName = buffer.readString();
    const partnerItemsLen = buffer.readShort();
    this.partnerItems = new Array(partnerItemsLen);
    for (let i = 0; i < partnerItemsLen; i++) {
      const item = new TradeItem();
      item.read(buffer);
      this.partnerItems[i] = item;
    }
  }
}
