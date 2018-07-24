import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when a new ability has been unlocked by the player.
 */
export class NewAbilityMessage implements IncomingPacket {

  type = PacketType.NEWABILITY;
  propagate = true;

  //#region packet-specific members
  /**
   * The type of ability which has been unlocked.
   */
  abilityType: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.abilityType = buffer.readInt32();
  }
}
