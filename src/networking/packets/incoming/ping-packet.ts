import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class PingPacket implements IncomingPacket {

  type = PacketType.PING;

  //#region packet-specific members
  serial: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.serial = buffer.readInt32();
  }
}
