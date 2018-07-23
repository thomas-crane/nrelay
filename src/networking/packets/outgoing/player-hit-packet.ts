import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class PlayerHitPacket implements OutgoingPacket {

  type = PacketType.PLAYERHIT;

  //#region packet-specific members
  bulletId: number;
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeUnsignedByte(this.bulletId);
    buffer.writeInt32(this.objectId);
  }
}
