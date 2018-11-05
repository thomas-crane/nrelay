/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to change the client's account name.
 */
export class ChooseNamePacket implements OutgoingPacket {

  type = PacketType.CHOOSENAME;

  //#region packet-specific members
  /**
   * The name to change the account's name to.
   */
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
