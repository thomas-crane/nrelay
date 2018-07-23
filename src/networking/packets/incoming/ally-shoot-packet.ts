import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class AllyShootPacket implements IncomingPacket {

  type = PacketType.ALLYSHOOT;

  //#region packet-specific members
  bulletId: number;
  ownerId: number;
  containerType: number;
  angle: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.bulletId = buffer.readUnsignedByte();
    this.ownerId = buffer.readInt32();
    this.containerType = buffer.readShort();
    this.angle = buffer.readFloat();
  }
}
