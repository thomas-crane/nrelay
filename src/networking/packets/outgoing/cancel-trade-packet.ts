import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to cancel the current active trade.
 */
export class CancelTradePacket implements OutgoingPacket {

  type = PacketType.CANCELTRADE;

  //#region packet-specific members
  /**
   * @deprecated This is not written to the packet when sending.
   */
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
