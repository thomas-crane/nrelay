/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received to tell the player the heroes left in the realm.
 */
export class RealmHeroLeftMessage implements IncomingPacket {

  type = PacketType.REALMHERO_LEFT_MSG;
  propagate = true;

  //#region packet-specific members
  /**
   * The number of realm heroes left.
   */
  realmHeroesLeft: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.realmHeroesLeft = buffer.readInt32();
  }
}
