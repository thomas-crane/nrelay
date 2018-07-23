import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class EnemyHitPacket implements OutgoingPacket {

  type = PacketType.ENEMYHIT;

  //#region packet-specific members
  time: number;
  bulletId: number;
  targetId: number;
  kill: boolean;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.time);
    buffer.writeByte(this.bulletId);
    buffer.writeInt32(this.targetId);
    buffer.writeBoolean(this.kill);
  }
}
