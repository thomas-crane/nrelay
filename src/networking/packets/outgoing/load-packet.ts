import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class LoadPacket implements OutgoingPacket {

  type = PacketType.LOAD;

  //#region packet-specific members
  charId: number;
  isFromArena: boolean;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.charId);
    buffer.writeBoolean(this.isFromArena);
  }
}
