import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';
import { WorldPosData } from '../../data/world-pos-data';

export class UseItemPacket implements OutgoingPacket {

  type = PacketType.USEITEM;

  //#region packet-specific members
  time: number;
  slotObject: SlotObjectData;
  itemUsePos: WorldPosData;
  useType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.slotObject.write(buffer);
    this.itemUsePos.write(buffer);
    buffer.writeByte(this.useType);
  }
}
