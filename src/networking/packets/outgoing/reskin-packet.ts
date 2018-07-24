import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to activate a new skin for the current character.
 */
export class ReskinPacket implements OutgoingPacket {

  type = PacketType.RESKIN;

  //#region packet-specific members
  /**
   * The id of the skin to activate.
   */
  skinId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.skinId);
  }
}
