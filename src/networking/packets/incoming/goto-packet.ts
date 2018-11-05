/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

/**
 * Received when an entity has moved to a new position.
 */
export class GotoPacket implements IncomingPacket {

  type = PacketType.GOTO;
  propagate = true;

  //#region packet-specific members
  /**
   * The object id of the entity which moved.
   */
  objectId: number;
  /**
   * The new position of the entity.
   */
  position: WorldPosData;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.position = new WorldPosData();
    this.position.read(buffer);
  }
}
