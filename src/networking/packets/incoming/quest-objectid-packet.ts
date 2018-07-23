import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class QuestObjectIdPacket implements IncomingPacket {

  type = PacketType.QUESTOBJID;

  //#region packet-specific members
  objectId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
  }
}
