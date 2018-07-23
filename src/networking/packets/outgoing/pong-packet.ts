import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class PongPacket implements OutgoingPacket {

  type = PacketType.PONG;

  //#region packet-specific members
  serial: number;
  time: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.serial);
    buffer.writeInt32(this.time);
  }
}
