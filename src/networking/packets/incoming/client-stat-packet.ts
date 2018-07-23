import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class ClientStatPacket implements IncomingPacket {

  type = PacketType.CLIENTSTAT;

  //#region packet-specific members
  name: string;
  value: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.value = buffer.readInt32();
  }
}
