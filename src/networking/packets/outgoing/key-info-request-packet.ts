import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class KeyInfoRequestPacket implements OutgoingPacket {

  type = PacketType.KEYINFO_REQUEST;

  //#region packet-specific members
  itemType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.itemType);
  }
}
