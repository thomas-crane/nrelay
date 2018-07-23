import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ClaimDailyRewardMessage implements OutgoingPacket {

  type = PacketType.CLAIMLOGIN_REWARD_MSG;

  //#region packet-specific members
  claimKey: string;
  claimType: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.claimKey);
    buffer.writeString(this.claimType);
  }
}
