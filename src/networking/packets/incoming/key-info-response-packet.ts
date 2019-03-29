/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * > Unknown.
 */
export class KeyInfoResponsePacket implements IncomingPacket {

  type = PacketType.KEY_INFO_RESPONSE;
  propagate = true;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  name: string;
  /**
   * > Unknown.
   */
  description: string;
  /**
   * > Unknown.
   */
  creator: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.description = buffer.readString();
    this.creator = buffer.readString();
  }
}
