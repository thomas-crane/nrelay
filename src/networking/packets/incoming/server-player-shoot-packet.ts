import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Received when another player shoots.
 */
export class ServerPlayerShootPacket implements IncomingPacket {

  type = PacketType.SERVERPLAYERSHOOT;
  propagate = true;

  //#region packet-specific members
  /**
   * The id of the bullet that was produced.
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
   * The starting position of the projectile.
   */
  startingPos: WorldPosData;
  /**
   * The angle at which the projectile was fired.
   */
  angle: number;
  /**
   * The damage which will be dealt by the projectile.
   */
  damage: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.bulletId = buffer.readUnsignedByte();
    this.ownerId = buffer.readInt32();
    this.containerType = buffer.readInt32();
    this.startingPos = new WorldPosData();
    this.startingPos.read(buffer);
    this.angle = buffer.readFloat();
    this.damage = buffer.readShort();
  }
}
