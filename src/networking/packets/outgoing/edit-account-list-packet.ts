/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to edit an account id list.
 */
export class EditAccountListPacket implements OutgoingPacket {

  type = PacketType.EDITACCOUNTLIST;

  //#region packet-specific members
  /**
   * The id of the account id list being edited.
   */
  accountListId: number;
  /**
   * Whether the edit is to add to the list or remove from it.
   */
  add: boolean;
  /**
   * The object id of the player to add to the list.
   */
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.accountListId);
    buffer.writeBoolean(this.add);
    buffer.writeInt32(this.objectId);
  }
}
