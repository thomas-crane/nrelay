import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class QuestRedeemResponsePacket implements IncomingPacket {

  type = PacketType.QUESTREDEEM_RESPONSE;

  //#region packet-specific members
  ok: boolean;
  message: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.ok = buffer.readBoolean();
    this.message = buffer.readString();
  }
}
