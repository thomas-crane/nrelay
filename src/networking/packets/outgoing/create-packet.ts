import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to create a new character.
 */
export class CreatePacket implements OutgoingPacket {

  type = PacketType.CREATE;

  //#region packet-specific members
  /**
   * The class to use for the new character.
   */
  classType: number;
  /**
   * The skin id to use for the new character.
   * The default skin id is `0`.
   */
  skinType: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeShort(this.classType);
    buffer.writeShort(this.skinType);
  }
}
