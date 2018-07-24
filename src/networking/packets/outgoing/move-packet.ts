import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';
import { MoveRecord } from '../../data/move-record';

/**
 * Sent to acknowledge a `NewTickPacket`, and to notify the
 * server of the client's current position and time.
 */
export class MovePacket implements OutgoingPacket {

  type = PacketType.MOVE;

  //#region packet-specific members
  /**
   * The tick id of the `NewTickPacket` which this is acknowledging.
   */
  tickId: number;
  /**
   * The current client time.
   */
  time: number;
  /**
   * The current client position.
   */
  newPosition: WorldPosData;
  /**
   * The move records of the client.
   *
   * This property can be an empty array.
   */
  records: MoveRecord[];
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeInt32(this.tickId);
    buffer.writeInt32(this.time);
    this.newPosition.write(buffer);
    this.records = [];
    buffer.writeShort(this.records.length);
    for (const record of this.records) {
      record.write(buffer);
    }
  }
}
