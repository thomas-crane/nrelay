/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to remove a player from the client's current guild.
 */
export class GuildRemovePacket implements OutgoingPacket {

  type = PacketType.GUILDREMOVE;

  //#region packet-specific members
  /**
   * The name of the player to remove.
   */
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
