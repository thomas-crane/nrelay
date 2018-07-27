/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received to give the player information about their stats.
 */
export class ClientStatPacket implements IncomingPacket {

  type = PacketType.CLIENTSTAT;
  propagate = true;

  //#region packet-specific members
  /**
   * The name of the stat.
   */
  name: string;
  /**
   * The value of the stat.
   */
  value: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.value = buffer.readInt32();
  }
}
