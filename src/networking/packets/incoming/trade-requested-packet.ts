import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when a trade is requested.
 */
export class TradeRequestedPacket implements IncomingPacket {

  type = PacketType.TRADEREQUESTED;

  //#region packet-specific members
  /**
   * The name of the player who requested the trade.
   */
  name: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
  }
}
