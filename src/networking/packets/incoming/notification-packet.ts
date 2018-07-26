/**
 * @module networking/packets/incoming
 */
import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received when a notification is received by the player.
 */
export class NotificationPacket implements IncomingPacket {

  type = PacketType.NOTIFICATION;
  propagate = true;

  //#region packet-specific members
  /**
   * The object id of the entity which the notification is for.
   */
  objectId: number;
  /**
   * The notification message.
   */
  message: string;
  /**
   * The color of the notification text.
   */
  color: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.objectId = buffer.readInt32();
    this.message = buffer.readString();
    this.color = buffer.readInt32();
  }
}
