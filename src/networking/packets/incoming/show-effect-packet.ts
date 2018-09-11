/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Received to tell the player to display an effect such as an AOE grenade.
 */
export class ShowEffectPacket implements IncomingPacket {

  type = PacketType.SHOWEFFECT;
  propagate = true;

  //#region packet-specific members
  /**
   * The type of effect to display.
   */
  effectType: number;
  /**
   * > Unknown. Probably the start position of the effect.
   */
  targetObjectId: number;
  /**
   * > Unknown. Probably the end position of the effect.
   */
  pos1: WorldPosData;
  /**
   * > Unknown.
   */
  pos2: WorldPosData;
  /**
   * The color of the effect.
   */
  color: number;
  /**
   * The duration of the effect.
   */
  duration: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.effectType = buffer.readUnsignedByte();
    this.targetObjectId = buffer.readInt32();
    this.pos1 = new WorldPosData();
    this.pos1.read(buffer);
    this.pos2 = new WorldPosData();
    this.pos2.read(buffer);
    this.color = buffer.readInt32();
    this.duration = buffer.readFloat();
  }
}
