import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class EditAccountListPacket implements OutgoingPacket {

  type = PacketType.EDITACCOUNTLIST;

  //#region packet-specific members
  accountListId: number;
  add: boolean;
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.accountListId);
    buffer.writeBoolean(this.add);
    buffer.writeInt32(this.objectId);
  }
}
