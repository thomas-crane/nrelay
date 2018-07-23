import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ChangeTradePacket implements OutgoingPacket {

  type = PacketType.CHANGETRADE;

  //#region packet-specific members
  offer: boolean[];
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeShort(this.offer.length);
    for (const slot of this.offer) {
      buffer.writeBoolean(slot);
    }
  }
}
