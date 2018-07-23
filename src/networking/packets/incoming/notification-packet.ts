import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class NotificationPacket implements IncomingPacket {

  type = PacketType.NOTIFICATION;

  //#region packet-specific members
  objectId: number;
  message: string;
  color: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.message = buffer.readString();
    this.color = buffer.readInt32();
  }
}
