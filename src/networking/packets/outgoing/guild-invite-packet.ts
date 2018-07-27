/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to invite a player to the client's current guild.
 */
export class GuildInvitePacket implements OutgoingPacket {

  type = PacketType.GUILDINVITE;

  //#region packet-specific members
  /**
   * The name of the player to invite.
   */
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
