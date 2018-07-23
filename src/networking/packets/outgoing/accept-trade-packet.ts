import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class AcceptTradePacket implements OutgoingPacket {

  type = PacketType.ACCEPTTRADE;

  //#region packet-specific members
  clientOffer: boolean[];
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
