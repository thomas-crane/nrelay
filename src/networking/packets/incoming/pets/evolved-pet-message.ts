import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

/**
 * Received to give the player information about a newly evolved pet.
 */
export class EvolvedPetMessage implements IncomingPacket {

  type = PacketType.EVOLVEPET;

  //#region packet-specific members
  /**
   * The id of the pet which has evolved.
   */
  petId: number;
  /**
   * The current skin id of the pet.
   */
  initialSkin: number;
  /**
   * The skin id of the pet after its evolution.
   */
  finalSkin: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petId = buffer.readInt32();
    this.initialSkin = buffer.readInt32();
    this.finalSkin = buffer.readInt32();
  }
}
