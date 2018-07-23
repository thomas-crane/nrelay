import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class ReconnectPacket implements IncomingPacket {

  type = PacketType.RECONNECT;

  //#region packet-specific members
  name: string;
  host: string;
  stats: string;
  port: number;
  gameId: number;
  keyTime: number;
  key: number[];
  isFromArena: boolean;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.host = buffer.readString();
    this.stats = buffer.readString();
    this.port = buffer.readInt32();
    this.gameId = buffer.readInt32();
    this.keyTime = buffer.readInt32();
    this.isFromArena = buffer.readBoolean();
    this.key = buffer.readByteArray();
  }
}
