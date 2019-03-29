/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * > Unknown.
 */
export class QuestRedeemResponsePacket implements IncomingPacket {

  type = PacketType.QUEST_REDEEM_RESPONSE;
  propagate = true;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  ok: boolean;
  /**
   * > Unknown.
   */
  message: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.ok = buffer.readBoolean();
    this.message = buffer.readString();
  }
}
