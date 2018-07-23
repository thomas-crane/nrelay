import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class NewAbilityMessage implements IncomingPacket {

  type = PacketType.NEWABILITY;

  //#region packet-specific members
  abilityType: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.abilityType = buffer.readInt32();
  }
}
