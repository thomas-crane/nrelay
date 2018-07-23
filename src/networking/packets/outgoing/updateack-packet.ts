import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class UpdateAckPacket implements OutgoingPacket {

  type = PacketType.UPDATEACK;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {

  }
}
