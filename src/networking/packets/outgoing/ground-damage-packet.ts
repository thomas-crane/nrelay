/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Sent when the client takes damage from a ground source, such as lava.
 */
export class GroundDamagePacket implements OutgoingPacket {

  type = PacketType.GROUNDDAMAGE;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The current client position.
   */
  position: WorldPosData;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.position.write(buffer);
  }
}
