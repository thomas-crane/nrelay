import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { OutgoingPacket } from '../../../packet';

/**
 * Sent to make an update to the pet currently following the player.
 */
export class ActivePetUpdateRequestPacket implements OutgoingPacket {

  type = PacketType.ACTIVEPET_UPDATE_REQUEST;

  //#region packet-specific members
  /**
   * The type of update to perform.
   */
  commandType: number;
  /**
   * The instance id of the pet to update.
   */
  instanceId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeByte(this.commandType);
    buffer.writeInt32(this.instanceId);
  }
}
