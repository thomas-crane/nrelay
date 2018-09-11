/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to acknowledge an `UpdatePacket`.
 */
export class UpdateAckPacket implements OutgoingPacket {

  type = PacketType.UPDATEACK;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {

  }
}
