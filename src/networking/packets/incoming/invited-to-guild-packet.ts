import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when the player is invited to a guild.
 */
export class InvitedToGuildPacket implements IncomingPacket {

  type = PacketType.INVITEDTOGUILD;

  //#region packet-specific members
  /**
   * The name of the player who sent the invite.
   */
  name: string;
  /**
   * The name of the guild which the invite is for.
   */
  guildName: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.guildName = buffer.readString();
  }
}
