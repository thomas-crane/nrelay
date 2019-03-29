/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

/**
 * Received to notify the player that a pet has been deleted.
 */
export class DeletePetMessage implements IncomingPacket {

  type = PacketType.DELETE_PET;
  propagate = true;

  //#region packet-specific members
  /**
   * The id of the pet which has been deleted.
   */
  petId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petId = buffer.readInt32();
  }
}
