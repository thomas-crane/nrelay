import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

export class EvolvedPetMessage implements IncomingPacket {

  type = PacketType.EVOLVEPET;

  //#region packet-specific members
  petId: number;
  initialSkin: number;
  finalSkin: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petId = buffer.readInt32();
    this.initialSkin = buffer.readInt32();
    this.finalSkin = buffer.readInt32();
  }
}
