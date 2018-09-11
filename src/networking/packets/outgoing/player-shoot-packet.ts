/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Sent when the player shoots a projectile.
 */
export class PlayerShootPacket implements OutgoingPacket {

  type = PacketType.PLAYERSHOOT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which was fired.
   */
  bulletId: number;
  /**
   * The item id of the weapon used to fire the projectile.
   */
  containerType: number;
  /**
   * The position at which the projectile was fired.
   */
  startingPos: WorldPosData;
  /**
   * The angle at which the projectile was fired.
   */
  angle: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeShort(this.containerType);
    this.startingPos.write(buffer);
    buffer.writeFloat(this.angle);
  }
}
