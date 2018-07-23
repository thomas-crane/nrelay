import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

export class ArenaDeathPacket implements IncomingPacket {

  type = PacketType.ARENADEATH;

  //#region packet-specific members
  cost: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.cost = buffer.readInt32();
  }
}
