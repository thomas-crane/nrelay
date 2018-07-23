import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class GotoPacket implements IncomingPacket {

  type = PacketType.GOTO;

  //#region packet-specific members
  objectId: number;
  position: WorldPosData;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.position = new WorldPosData();
    this.position.read(buffer);
  }
}
