import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class PlayerShootPacket implements OutgoingPacket {

  type = PacketType.PLAYERSHOOT;

  //#region packet-specific members
  time: number;
  bulletId: number;
  containerType: number;
  startingPos: WorldPosData;
  angle: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeShort(this.containerType);
    this.startingPos.write(buffer);
    buffer.writeFloat(this.angle);
  }
}
