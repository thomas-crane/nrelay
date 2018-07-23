import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class BuyResultPacket implements IncomingPacket {

  type = PacketType.BUYRESULT;

  //#region packet-specific members
  result: number;
  resultString: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.result = buffer.readInt32();
    this.resultString = buffer.readString();
  }
}
