/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received in response to a `BuyPacket`.
 */
export class BuyResultPacket implements IncomingPacket {

  type = PacketType.BUYRESULT;
  propagate = true;

  //#region packet-specific members
  /**
   * The result code.
   */
  result: number;
  /**
   * > Unknown.
   */
  resultString: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.result = buffer.readInt32();
    this.resultString = buffer.readString();
  }
}
