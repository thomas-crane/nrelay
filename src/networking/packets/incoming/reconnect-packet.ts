import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received to instruct the client to connect to a new host.
 */
export class ReconnectPacket implements IncomingPacket {

  type = PacketType.RECONNECT;

  //#region packet-specific members
  /**
   * The name of the new host.
   */
  name: string;
  /**
   * The address of the new host.
   */
  host: string;
  /**
   * > Unknown.
   */
  stats: string;
  /**
   * The port of the new host.
   */
  port: number;
  /**
   * The `gameId` to send in the next `HelloPacket`.
   */
  gameId: number;
  /**
   * The `keyTime` to send in the next `HelloPacket`.
   */
  keyTime: number;
  /**
   * The `key` to send in the next `HelloPacket`.
   */
  key: number[];
  /**
   * Whether or not the new host is from the arena.
   */
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
