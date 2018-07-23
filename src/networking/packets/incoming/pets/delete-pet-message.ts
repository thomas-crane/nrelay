import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

export class DeletePetMessage implements IncomingPacket {

  type = PacketType.DELETEPET;

  //#region packet-specific members
  petId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.petId = buffer.readInt32();
  }
}
