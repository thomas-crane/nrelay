import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received in response to a `CreatePacket`.
 */
export class CreateSuccessPacket implements IncomingPacket {

  type = PacketType.CREATESUCCESS;

  //#region packet-specific members
  /**
   * The object id of the player's character.
   */
  objectId: number;
  /**
   * The character id of the player's character.
   */
  charId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.charId = buffer.readInt32();
  }
}
