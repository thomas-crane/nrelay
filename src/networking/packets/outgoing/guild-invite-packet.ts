import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class GuildInvitePacket implements OutgoingPacket {

  type = PacketType.GUILDINVITE;

  //#region packet-specific members
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
