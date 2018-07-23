import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class ShowEffectPacket implements IncomingPacket {

  type = PacketType.SHOWEFFECT;

  //#region packet-specific members
  effectType: number;
  targetObjectId: number;
  pos1: WorldPosData;
  pos2: WorldPosData;
  color: number;
  duration: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.effectType = buffer.readUnsignedByte();
    this.targetObjectId = buffer.readInt32();
    this.pos1 = new WorldPosData();
    this.pos1.read(buffer);
    this.pos2 = new WorldPosData();
    this.pos2.read(buffer);
    this.color = buffer.readInt32();
    this.duration = buffer.readFloat();
  }
}
