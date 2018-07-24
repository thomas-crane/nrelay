import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received occasionally by the server to prompt a response from the client.
 */
export class PingPacket implements IncomingPacket {

  type = PacketType.PING;
  propagate = true;

  //#region packet-specific members
  /**
   * A nonce value which is expected to be present in the reply.
   */
  serial: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.serial = buffer.readInt32();
  }
}
