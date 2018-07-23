import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class TeleportPacket implements OutgoingPacket {

  type = PacketType.TELEPORT;

  //#region packet-specific members
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
  }
}
