/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Received when an AoE grenade has hit the ground.
 */
export class AoePacket implements IncomingPacket {

  type = PacketType.AOE;
  propagate = true;

  //#region packet-specific members
  /**
   * The position which the grenade landed at.
   */
  pos: WorldPosData;
  /**
   * The radius of the grenades area of effect, in game tiles.
   */
  radius: number;
  /**
   * The damage dealt by the grenade.
   */
  damage: number;
  /**
   * The condition effect applied by the grenade.
   */
  effect: number;
  /**
   * The duration of the effect applied.
   * @see `AoePacket.effect`.
   */
  duration: number;
  /**
   * > Unknown.
   */
  origType: number;
  /**
   * The color of the grenade's explosion particles.
   * > The encoding of the color is unknown.
   */
  color: number;
  /**
   * Whether or not this AoE grenade is armor piercing.
   */
  armorPiercing: boolean;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.pos = new WorldPosData();
    this.pos.read(buffer);
    this.radius = buffer.readFloat();
    this.damage = buffer.readUnsignedShort();
    this.effect = buffer.readUnsignedByte();
    this.duration = buffer.readFloat();
    this.origType = buffer.readUnsignedShort();
    this.color = buffer.readInt32();
    this.armorPiercing = buffer.readBoolean();
  }
}
