import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class JoinGuildPacket implements OutgoingPacket {

  type = PacketType.JOINGUILD;

  //#region packet-specific members
  guildName: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.guildName);
  }
}
