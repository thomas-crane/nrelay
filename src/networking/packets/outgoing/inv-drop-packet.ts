import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';

export class InvDropPacket implements OutgoingPacket {

  type = PacketType.INVDROP;

  //#region packet-specific members
  slotObject: SlotObjectData;
  //#endregion

  write(buffer: PacketBuffer): void {
    this.slotObject.write(buffer);
  }
}
