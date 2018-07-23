import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class CreateSuccessPacket implements IncomingPacket {

  type = PacketType.CREATESUCCESS;

  //#region packet-specific members
  objectId: number;
  charId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.charId = buffer.readInt32();
  }
}
