/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to claim rewards from the login calendar.
 */
export class ClaimDailyRewardMessage implements OutgoingPacket {

  type = PacketType.CLAIM_LOGIN_REWARD_MSG;

  //#region packet-specific members
  /**
   * The key of the item being claimed.
   */
  claimKey: string;
  /**
   * The type of claim being made.
   */
  claimType: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.claimKey);
    buffer.writeString(this.claimType);
  }
}
