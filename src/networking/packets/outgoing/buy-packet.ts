import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to buy an item.
 */
export class BuyPacket implements OutgoingPacket {

  type = PacketType.BUY;

  //#region packet-specific members
  /**
   * The object id of the item being purchased.
   */
  objectId: number;
  /**
   * The number of items being purchased.
   */
  quantity: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
    buffer.writeInt32(this.quantity);
  }
}
