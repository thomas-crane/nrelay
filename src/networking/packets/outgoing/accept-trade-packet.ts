import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to accept the current active trade.
 */
export class AcceptTradePacket implements OutgoingPacket {

  type = PacketType.ACCEPTTRADE;

  //#region packet-specific members
  /**
   * A description of which items in the client's inventory are selected.
   * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
   *
   * If a value is `true`, then the item is selected.
   */
  clientOffer: boolean[];
  /**
   * A description of which items in the trade partner's inventory are selected.
   * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
   *
   * If a value is `true`, then the item is selected.
   */
  partnerOffer: boolean[];
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeShort(this.clientOffer.length);
    for (const slot of this.clientOffer) {
      buffer.writeBoolean(slot);
    }
    buffer.writeShort(this.partnerOffer.length);
    for (const slot of this.partnerOffer) {
      buffer.writeBoolean(slot);
    }
  }
}
