import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class TradeAcceptedPacket implements IncomingPacket {

  type = PacketType.TRADEACCEPTED;

  //#region packet-specific members
  clientOffer: boolean[];
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
