import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { SlotObjectData } from '../../../data/slot-object-data';
import { OutgoingPacket } from '../../../packet';

export class QuestRedeemPacket implements OutgoingPacket {

  type = PacketType.QUESTREDEEM;

  //#region packet-specific members
  questId: string;
  slots: SlotObjectData[];
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.questId);
    buffer.writeShort(this.slots.length);
    for (const slot of this.slots) {
      slot.write(buffer);
    }
  }
}
