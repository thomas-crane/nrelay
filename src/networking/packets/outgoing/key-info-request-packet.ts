/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * > Unknown.
 */
export class KeyInfoRequestPacket implements OutgoingPacket {

  type = PacketType.KEY_INFO_REQUEST;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  itemType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.itemType);
  }
}
