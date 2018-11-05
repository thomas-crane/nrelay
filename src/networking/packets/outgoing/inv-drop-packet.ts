/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';

/**
 * Sent to drop an item from the client's inventory.
 */
export class InvDropPacket implements OutgoingPacket {

  type = PacketType.INVDROP;

  //#region packet-specific members
  /**
   * The slot to drop the item from.
   */
  slotObject: SlotObjectData;
  //#endregion

  write(buffer: PacketBuffer): void {
    this.slotObject.write(buffer);
  }
}
