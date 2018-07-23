import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class UsePortalPacket implements OutgoingPacket {

  type = PacketType.USEPORTAL;

  //#region packet-specific members
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
  }
}
