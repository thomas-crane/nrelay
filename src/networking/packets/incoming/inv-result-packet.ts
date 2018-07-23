import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class InvResultPacket implements IncomingPacket {

  type = PacketType.INVRESULT;

  //#region packet-specific members
  result: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.result = buffer.readInt32();
  }
}
