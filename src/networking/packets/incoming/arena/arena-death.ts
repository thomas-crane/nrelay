/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

/**
 * Received when the player has been killed in the arena.
 */
export class ArenaDeathPacket implements IncomingPacket {

  type = PacketType.ARENADEATH;
  propagate = true;

  //#region packet-specific members
  /**
   * The cost in gold to be revived.
   */
  cost: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.cost = buffer.readInt32();
  }
}
