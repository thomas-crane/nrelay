import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class AoePacket implements IncomingPacket {

  type = PacketType.AOE;

  //#region packet-specific members
  pos: WorldPosData;
  radius: number;
  damage: number;
  effect: number;
  duration: number;
  origType: number;
  color: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.pos = new WorldPosData();
    this.pos.read(buffer);
    this.radius = buffer.readFloat();
    this.damage = buffer.readUnsignedShort();
    this.effect = buffer.readUnsignedByte();
    this.duration = buffer.readFloat();
    this.origType = buffer.readUnsignedShort();
    this.color = buffer.readInt32();
  }
}
