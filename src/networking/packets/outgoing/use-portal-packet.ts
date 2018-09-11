/**
 * @module networking/packets/outgoing
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to prompt the server to send a `ReconnectPacket` which
 * contains the reconnect information for the used portal.
 */
export class UsePortalPacket implements OutgoingPacket {

  type = PacketType.USEPORTAL;

  //#region packet-specific members
  /**
   * The object id of the portal to enter.
   */
  objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.objectId);
  }
}
