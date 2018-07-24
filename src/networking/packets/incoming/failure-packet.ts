import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { FailureCode } from '../../../models/failure-code';

/**
 * Received when an error has occurred.
 */
export class FailurePacket implements IncomingPacket {

  type = PacketType.FAILURE;
  propagate = true;

  //#region packet-specific members
  /**
   * The error id of the failure.
   * @see `FailureCode`
   */
  errorId: FailureCode;
  /**
   * A description of the error.
   */
  errorDescription: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.errorId = buffer.readInt32();
    this.errorDescription = buffer.readString();
  }
}
