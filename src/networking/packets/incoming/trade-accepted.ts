import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when the active trade is accepted.
 */
export class TradeAcceptedPacket implements IncomingPacket {

  type = PacketType.TRADEACCEPTED;

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

  read(buffer: PacketBuffer): void {
    const clientOfferLen = buffer.readShort();
    this.clientOffer = new Array<boolean>(clientOfferLen);
    for (let i = 0; i < clientOfferLen; i++) {
      this.clientOffer[i] = buffer.readBoolean();
    }
    const partnerOfferLen = buffer.readShort();
    this.partnerOffer = new Array<boolean>(partnerOfferLen);
    for (let i = 0; i < partnerOfferLen; i++) {
      this.partnerOffer[i] = buffer.readBoolean();
    }
  }
}
