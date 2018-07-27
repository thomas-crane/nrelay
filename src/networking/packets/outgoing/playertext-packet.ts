/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent when the client sends a chat message.
 */
export class PlayerTextPacket implements OutgoingPacket {

  type = PacketType.PLAYERTEXT;

  //#region packet-specific members
  /**
   * The message to send.
   */
  text: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.text);
  }
}
