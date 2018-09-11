/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent when the player inflicts a condition effect.
 */
export class SetConditionPacket implements OutgoingPacket {

  type = PacketType.SETCONDITION;

  //#region packet-specific members
  /**
   * The condition effect being conflicted.
   */
  conditionEffect: number;
  /**
   * The duration of the conditin effect.
   */
  conditionDuration: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeByte(this.conditionEffect);
    buffer.writeFloat(this.conditionDuration);
  }
}
