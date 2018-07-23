import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ShootAckPacket implements OutgoingPacket {

  type = PacketType.SHOOTACK;

  //#region packet-specific members
  time: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
  }
}
