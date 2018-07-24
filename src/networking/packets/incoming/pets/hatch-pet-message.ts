import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

/**
 * Recieved to give the player information about a newly hatched pet.
 */
export class HatchPetMessage implements IncomingPacket {

  type = PacketType.HATCHPET;
  propagate = true;

  //#region packet-specific members
  /**
   * The name of the hatched pet.
   */
  petName: string;
  /**
   * The skin id of the hatched pet.
   */
  petSkin: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petName = buffer.readString();
    this.petSkin = buffer.readInt32();
  }
}
