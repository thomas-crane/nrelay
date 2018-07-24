import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to teleport to another player.
 */
export class TeleportPacket implements OutgoingPacket {

  type = PacketType.TELEPORT;

  //#region packet-specific members
  /**
   * The object id of the player to teleport to.
   */
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
  }
}
