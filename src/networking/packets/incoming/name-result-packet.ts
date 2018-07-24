import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received in response to a `ChooseNamePacket`.
 */
export class NameResultPacket implements IncomingPacket {

  type = PacketType.NAMERESULT;
  propagate = true;

  //#region packet-specific members
  /**
   * Whether or not the name change was successful.
   */
  success: boolean;
  /**
   * The error which occurred, if the result was not successful.
   */
  errorText: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.success = buffer.readBoolean();
    this.errorText = buffer.readString();
  }
}
