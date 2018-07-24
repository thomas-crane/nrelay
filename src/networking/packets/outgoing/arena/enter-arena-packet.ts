import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { OutgoingPacket } from '../../../packet';

/**
 * Sent to enter the arena.
 */
export class EnterArenaPacket implements OutgoingPacket {

  type = PacketType.ENTERARENA;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  currency: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.currency);
  }
}
