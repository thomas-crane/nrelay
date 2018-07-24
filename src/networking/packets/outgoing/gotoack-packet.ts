import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to acknowledge a `GotoPacket`.
 */
export class GotoAckPacket implements OutgoingPacket {

  type = PacketType.GOTOACK;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
  }
}
