import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

export class HatchPetMessage implements IncomingPacket {

  type = PacketType.HATCHPET;

  //#region packet-specific members
  petName: string;
  petSkin: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petName = buffer.readString();
    this.petSkin = buffer.readInt32();
  }
}
