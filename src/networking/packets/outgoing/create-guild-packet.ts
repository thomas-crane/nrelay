/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to create a new guild.
 */
export class CreateGuildPacket implements OutgoingPacket {

  type = PacketType.CREATEGUILD;

  //#region packet-specific members
  /**
   * The name of the guild being created.
   */
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
