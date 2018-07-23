import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { TradeResult } from '../../../models/trade-result';

export class TradeDonePacket implements IncomingPacket {

  type = PacketType.TRADEDONE;

  //#region packet-specific members
  code: TradeResult;
  description: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.code = buffer.readInt32();
    this.description = buffer.readString();
  }
}
