import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';
import { SlotObjectData } from '../../data/slot-object-data';

export class InvSwapPacket implements OutgoingPacket {

  type = PacketType.INVSWAP;

  //#region packet-specific members
  time: number;
  position: WorldPosData;
  slotObject1: SlotObjectData;
  slotObject2: SlotObjectData;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.slotObject1.write(buffer);
    this.slotObject2.write(buffer);
  }
}
