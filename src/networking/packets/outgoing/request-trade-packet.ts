import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class RequestTradePacket implements OutgoingPacket {

  type = PacketType.REQUESTTRADE;

  //#region packet-specific members
  name: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
  }
}
