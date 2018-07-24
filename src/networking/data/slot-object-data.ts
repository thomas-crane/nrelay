import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class SlotObjectData implements DataPacket {

  /**
   * The object id of the entity which owns the slot.
   */
  objectId: number;
  /**
   * The index of the slot. E.g. The 4th inventory slot has the slot id `3`.
   */
  slotId: number;
  /**
   * The item id of the item in the slot, or `-1` if it is empty.
   */
  objectType: number;

  read(packet: PacketBuffer): void {
    this.objectId = packet.readInt32();
    this.slotId = packet.readUnsignedByte();
    this.objectType = packet.readUInt32();
  }

  write(packet: PacketBuffer): void {
    packet.writeInt32(this.objectId);
    packet.writeUnsignedByte(this.slotId);
    packet.writeInt32(this.objectType);
  }
}
