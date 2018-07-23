import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class ClaimDailyRewardResponse implements IncomingPacket {

  type = PacketType.LOGINREWARD_MSG;

  //#region packet-specific members
  itemId: number;
  quantity: number;
  gold: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.itemId = buffer.readInt32();
    this.quantity = buffer.readInt32();
    this.gold = buffer.readInt32();
  }
}
