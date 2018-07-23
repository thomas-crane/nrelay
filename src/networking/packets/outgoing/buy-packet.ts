import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class BuyPacket implements OutgoingPacket {

  type = PacketType.BUY;

  //#region packet-specific members
  objectId: number;
  quantity: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
    buffer.writeInt32(this.quantity);
  }
}
