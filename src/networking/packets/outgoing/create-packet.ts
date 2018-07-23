import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class CreatePacket implements OutgoingPacket {

  type = PacketType.CREATE;

  //#region packet-specific members
  classType: number;
  skinType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeShort(this.classType);
    buffer.writeShort(this.skinType);
  }
}
