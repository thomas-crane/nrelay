/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent when a non-destructable object, such as a tree, has been hit by a player.
 */
export class OtherHitPacket implements OutgoingPacket {

  type = PacketType.OTHERHIT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which hit the object.
   */
  bulletId: number;
  /**
   * The object id of player who fired the projectile which hit the object.
   */
  objectId: number;
  /**
   * The object id of the object which was hit.
   */
  targetId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeInt32(this.objectId);
    buffer.writeInt32(this.targetId);
  }
}
