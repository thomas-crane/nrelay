import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { TradeItem } from '../../data/trade-item';

/**
 * Received when a new active trade has been initiated.
 */
export class TradeStartPacket implements IncomingPacket {

  type = PacketType.TRADESTART;
  propagate = true;

  //#region packet-specific members
  /**
   * A description of the player's inventory. Items 0-3 are the hotbar items,
   * and 4-12 are the 8 inventory slots.
   */
  clientItems: TradeItem[];
  /**
   * The trade partner's name.
   */
  partnerName: string;
  /**
   * A description of the trade partner's inventory. Items 0-3 are the
   * hotbar items, and 4-12 are the 8 inventory slots.
   */
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
