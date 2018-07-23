import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class FailurePacket implements IncomingPacket {

  //#region error codes
  static INCORRECT_VERSION = 4;
  static BAD_KEY = 5;
  static INVALID_TELEPORT_TARGET = 6;
  static EMAIL_VERIFICATION_NEEDED = 7;
  static TELEPORT_REALM_BLOCK = 9;
  //#endregion

  type = PacketType.FAILURE;

  //#region packet-specific members
  errorId: number;
  errorDescription: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.errorId = buffer.readInt32();
    this.errorDescription = buffer.readString();
  }
}
