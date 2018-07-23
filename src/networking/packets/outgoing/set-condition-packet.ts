import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class SetConditionPacket implements OutgoingPacket {

  type = PacketType.SETCONDITION;

  //#region packet-specific members
  conditionEffect: number;
  conditionDuration: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeByte(this.conditionEffect);
    buffer.writeFloat(this.conditionDuration);
  }
}
