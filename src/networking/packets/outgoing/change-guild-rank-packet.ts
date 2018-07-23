import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class ChangeGuildRankPacket implements OutgoingPacket {

  type = PacketType.CHANGEGUILDRANK;

  //#region packet-specific members
  name: string;
  guildRank: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.name);
    buffer.writeInt32(this.guildRank);
  }
}
