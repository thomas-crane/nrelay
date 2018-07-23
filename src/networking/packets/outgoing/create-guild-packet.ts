import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class CreateGuildPacket implements OutgoingPacket {

  type = PacketType.CREATEGUILD;

  //#region packet-specific members
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
