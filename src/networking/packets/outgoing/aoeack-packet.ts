/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Sent to acknowledge an `AoePacket`.
 */
export class AoeAckPacket implements OutgoingPacket {

  type = PacketType.AOEACK;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The position of the AoE which this packet is acknowledging.
   */
  position: WorldPosData;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.position.write(buffer);
  }
}
