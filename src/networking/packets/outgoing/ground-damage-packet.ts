import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class GroundDamagePacket implements OutgoingPacket {

  type = PacketType.GROUNDDAMAGE;

  //#region packet-specific members
  time: number;
  position: WorldPosData;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    this.position.write(buffer);
  }
}
