import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class OtherHitPacket implements OutgoingPacket {

  type = PacketType.OTHERHIT;

  //#region packet-specific members
  time: number;
  bulletId: number;
  objectId: number;
  targetId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeInt32(this.objectId);
    buffer.writeInt32(this.targetId);
  }
}
