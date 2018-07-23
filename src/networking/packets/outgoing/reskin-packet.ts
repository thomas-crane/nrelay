import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ReskinPacket implements OutgoingPacket {

  type = PacketType.RESKIN;

  //#region packet-specific members
  skinId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.skinId);
  }
}
