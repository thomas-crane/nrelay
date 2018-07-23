import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class DamagePacket implements IncomingPacket {

  type = PacketType.DAMAGE;

  //#region packet-specific members
  targetId: number;
  effects: number[];
  damageAmount: number;
  kill: boolean;
  armorPierce: boolean;
  bulletId: number;
  objectId: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.targetId = buffer.readInt32();
    const effectsLen = buffer.readUnsignedByte();
    this.effects = new Array<number>(effectsLen);
    for (let i = 0; i < effectsLen; i++) {
      this.effects[i] = buffer.readUnsignedByte();
    }
    this.damageAmount = buffer.readUnsignedShort();
    this.kill = buffer.readBoolean();
    this.armorPierce = buffer.readBoolean();
    this.bulletId = buffer.readUnsignedByte();
    this.objectId = buffer.readInt32();
  }
}
