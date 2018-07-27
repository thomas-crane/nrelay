/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Sent to use an item, such as an ability or consumable.
 */
export class UseItemPacket implements OutgoingPacket {

  type = PacketType.USEITEM;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The slot of the item being used.
   */
  slotObject: SlotObjectData;
  /**
   * The position at which the item was used.
   */
  itemUsePos: WorldPosData;
  /**
   * The type of item usage.
   */
  useType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.slotObject.write(buffer);
    this.itemUsePos.write(buffer);
    buffer.writeByte(this.useType);
  }
}
