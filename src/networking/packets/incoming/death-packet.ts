import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when a player has died.
 */
export class DeathPacket implements IncomingPacket {

  type = PacketType.DEATH;
  propagate = true;

  //#region packet-specific members
  /**
   * The account id of the player who died.
   */
  accountId: string;
  /**
   * The character id of the player who died.
   */
  charId: number;
  /**
   * The cause of death.
   */
  killedBy: string;
  /**
   * The object id of the zombie, if the player died wearing a cursed amulet.
   */
  zombieId: number;
  /**
   * The type of zombie, if the player died wearing a cursed amulet.
   */
  zombieType: number;
  /**
   * Whether or not a zombie was spawned.
   *
   * This is a derived property, and is the result of `zombieId !== -1`.
   */
  isZombie: boolean;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.accountId = buffer.readString();
    this.charId = buffer.readInt32();
    this.killedBy = buffer.readString();
    this.zombieType = buffer.readInt32();
    this.zombieId = buffer.readInt32();
    this.isZombie = this.zombieId !== -1;
  }
}
