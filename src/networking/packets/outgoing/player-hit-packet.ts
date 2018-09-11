/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent when the player is hit.
 */
export class PlayerHitPacket implements OutgoingPacket {

  type = PacketType.PLAYERHIT;

  //#region packet-specific members
  /**
   * The id of the bullet which hit the player.
   */
  bulletId: number;
  /**
   * The object id of the enemy that hit the player.
   */
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeUnsignedByte(this.bulletId);
    buffer.writeInt32(this.objectId);
  }
}
