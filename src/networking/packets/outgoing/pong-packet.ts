import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to acknowledge the `PingPacket.`
 */
export class PongPacket implements OutgoingPacket {

  type = PacketType.PONG;

  //#region packet-specific members
  /**
   * The serial value received in the `PingPacket` which this acknowledges.
   */
  serial: number;
  /**
   * The current client time.
   */
  time: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.serial);
    buffer.writeInt32(this.time);
  }
}
