import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class EnemyShootPacket implements IncomingPacket {

  type = PacketType.ENEMYSHOOT;

  //#region packet-specific members
  bulletId: number;
  ownerId: number;
  bulletType: number;
  startingPos: WorldPosData;
  angle: number;
  damage: number;
  numShots: number;
  angleInc: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.bulletId = buffer.readUnsignedByte();
    this.ownerId = buffer.readInt32();
    this.bulletType = buffer.readUnsignedByte();
    this.startingPos = new WorldPosData();
    this.startingPos.read(buffer);
    this.angle = buffer.readFloat();
    this.damage = buffer.readShort();
    if (buffer.bufferIndex < buffer.data.length) {
      this.numShots = buffer.readUnsignedByte();
      this.angleInc = buffer.readFloat();
    } else {
      this.numShots = 1;
      this.angleInc = 0;
    }
  }
}
