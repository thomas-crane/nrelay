import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class PlayerTextPacket implements OutgoingPacket {

  type = PacketType.PLAYERTEXT;

  //#region packet-specific members
  text: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.text);
  }
}
