import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class GotoAckPacket implements OutgoingPacket {

  type = PacketType.GOTOACK;

  //#region packet-specific members
  time: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
  }
}
