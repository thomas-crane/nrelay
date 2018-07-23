import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ChooseNamePacket implements OutgoingPacket {

  type = PacketType.CHOOSENAME;

  //#region packet-specific members
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
