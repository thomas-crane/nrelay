import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class NameResultPacket implements IncomingPacket {

  type = PacketType.NAMERESULT;

  //#region packet-specific members
  success: boolean;
  errorText: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.success = buffer.readBoolean();
    this.errorText = buffer.readString();
  }
}
