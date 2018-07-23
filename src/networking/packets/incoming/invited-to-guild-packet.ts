import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class InvitedToGuildPacket implements IncomingPacket {

  type = PacketType.INVITEDTOGUILD;

  //#region packet-specific members
  name: string;
  guildName: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.guildName = buffer.readString();
  }
}
