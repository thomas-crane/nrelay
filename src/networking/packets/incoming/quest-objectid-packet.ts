import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received to tell the player the object id of their current quest.
 */
export class QuestObjectIdPacket implements IncomingPacket {

  type = PacketType.QUESTOBJID;

  //#region packet-specific members
  /**
   * The object id of the current quest.
   */
  objectId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
  }
}
