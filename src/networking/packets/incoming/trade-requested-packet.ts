import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class TradeRequestedPacket implements IncomingPacket {

  type = PacketType.TRADEREQUESTED;

  //#region packet-specific members
  name: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
  }
}
