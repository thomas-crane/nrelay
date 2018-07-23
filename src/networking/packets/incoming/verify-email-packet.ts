import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class VerifyEmailPacket implements IncomingPacket {

  type = PacketType.VERIFYEMAIL;

  //#region packet-specific members

  //#endregion

  read(buffer: PacketBuffer): void {
    //
  }
}
