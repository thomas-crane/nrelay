import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class ReskinUnlockPacket implements IncomingPacket {

  type = PacketType.RESKINUNLOCK;

  //#region packet-specific members
  skinId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.skinId = buffer.readInt32();
  }
}
