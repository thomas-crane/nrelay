import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class CheckCreditsPacket implements OutgoingPacket {

  type = PacketType.CHECKCREDITS;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
