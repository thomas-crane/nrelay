import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { ObjectStatusData } from '../../data/object-status-data';

/**
 * Received to notify the player of a new game tick.
 */
export class NewTickPacket implements IncomingPacket {

  type = PacketType.NEWTICK;

  //#region packet-specific members
  /**
   * The id of the tick.
   */
  tickId: number;
  /**
   * The time between the last tick and this tick, in milliseconds.
   *
   * This is not always accurate, so it is better to calculate it manually
   * if millisecond-level accuracy is required.
   */
  tickTime: number;
  /**
   * An array of statuses for objects which are currently visible to the player.
   *
   * "visible" objects can include objects which would normally be off screen,
   * such as players, which are always at least visible on the minimap.
   */
  statuses: ObjectStatusData[];
  //#endregion

  read(buffer: PacketBuffer): void {
    this.tickId = buffer.readInt32();
    this.tickTime = buffer.readInt32();
    const statusesLen = buffer.readShort();
    this.statuses = new Array<ObjectStatusData>(statusesLen);
    for (let i = 0; i < statusesLen; i++) {
      const osd = new ObjectStatusData();
      osd.read(buffer);
      this.statuses[i] = osd;
    }
  }
}
