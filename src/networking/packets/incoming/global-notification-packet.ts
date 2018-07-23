import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class GlobalNotificationPacket implements IncomingPacket {

  type = PacketType.GLOBALNOTIFICATION;

  //#region packet-specific members
  notificationType: number;
  text: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.notificationType = buffer.readInt32();
    this.text = buffer.readString();
  }
}
