import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * > Unknown.
 */
export class InvResultPacket implements IncomingPacket {

  type = PacketType.INVRESULT;
  propagate = true;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  result: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.result = buffer.readInt32();
  }
}
