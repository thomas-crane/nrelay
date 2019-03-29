/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received in response to a `ClaimDailyRewardMessage`.
 */
export class ClaimDailyRewardResponse implements IncomingPacket {

  type = PacketType.LOGIN_REWARD_MSG;
  propagate = true;

  //#region packet-specific members
  /**
   * The item id of the reward received.
   */
  itemId: number;
  /**
   * The number of items received.
   */
  quantity: number;
  /**
   * Unknown.
   */
  gold: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.itemId = buffer.readInt32();
    this.quantity = buffer.readInt32();
    this.gold = buffer.readInt32();
  }
}
