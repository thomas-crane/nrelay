import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class PasswordPromptPacket implements IncomingPacket {

  type = PacketType.PASSWORDPROMPT;

  //#region packet-specific members
  cleanPasswordStatus: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.cleanPasswordStatus = buffer.readInt32();
  }
}
