import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received to notify the player that a new skin has been unlocked.
 */
export class ReskinUnlockPacket implements IncomingPacket {

  type = PacketType.RESKINUNLOCK;

  //#region packet-specific members
  /**
   * The id of the skin that was unlocked.
   */
  skinId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.skinId = buffer.readInt32();
  }
}
