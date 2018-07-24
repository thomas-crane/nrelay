import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when another player shoots a projectile.
 */
export class AllyShootPacket implements IncomingPacket {

  type = PacketType.ALLYSHOOT;
  propagate = true;

  //#region packet-specific members
  /**
   * The bullet id of the projectile which was produced.
   */
  bulletId: number;
  /**
   * The object id of the player who fired the projectile.
   */
  ownerId: number;
  /**
   * The item id of the weapon used to fire the projectile.
   */
  containerType: number;
  /**
   * The angle at which the projectile was fired.
   */
  angle: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.bulletId = buffer.readUnsignedByte();
    this.ownerId = buffer.readInt32();
    this.containerType = buffer.readShort();
    this.angle = buffer.readFloat();
  }
}
