import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class EscapePacket implements OutgoingPacket {

  type = PacketType.ESCAPE;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
