import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * > Unknown.
 */
export class GuildResultPacket implements IncomingPacket {

  type = PacketType.GUILDRESULT;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  success: boolean;
  /**
   * > Unknown.
   */
  lineBuilderJSON: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.success = buffer.readBoolean();
    this.lineBuilderJSON = buffer.readString();
  }
}
