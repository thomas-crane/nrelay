import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when the active trade is changed.
 */
export class TradeChangedPacket implements IncomingPacket {

  type = PacketType.TRADECHANGED;
  propagate = true;

  //#region packet-specific members
  /**
   * A description of which items in the trade partner's inventory are selected.
   * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
   *
   * If a value is `true`, then the item is selected.
   */
  offer: boolean[];
  //#endregion

  read(buffer: PacketBuffer): void {
    const offerLen = buffer.readShort();
    this.offer = new Array<boolean>(offerLen);
    for (let i = 0; i < offerLen; i++) {
      this.offer[i] = buffer.readBoolean();
    }
  }
}
