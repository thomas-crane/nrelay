import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent when an enemy has been hit by the player.
 */
export class EnemyHitPacket implements OutgoingPacket {

  type = PacketType.ENEMYHIT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which hit the enemy.
   */
  bulletId: number;
  /**
   * The object id of the enemy which was hit.
   */
  targetId: number;
  /**
   * Whether or not the projectile will kill the enemy.
   */
  kill: boolean;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeInt32(this.targetId);
    buffer.writeBoolean(this.kill);
  }
}
