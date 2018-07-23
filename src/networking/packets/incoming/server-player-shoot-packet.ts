import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class ServerPlayerShootPacket implements IncomingPacket {

  type = PacketType.SERVERPLAYERSHOOT;

  //#region packet-specific members
  bulletId: number;
  ownerId: number;
  containerType: number;
  startingPos: WorldPosData;
  angle: number;
  damage: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.bulletId = buffer.readUnsignedByte();
    this.ownerId = buffer.readInt32();
    this.containerType = buffer.readInt32();
    this.startingPos = new WorldPosData();
    this.startingPos.read(buffer);
    this.angle = buffer.readFloat();
    this.damage = buffer.readShort();
  }
}
