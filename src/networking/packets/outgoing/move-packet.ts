import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';
import { MoveRecord } from '../../data/move-record';

export class MovePacket implements OutgoingPacket {

  type = PacketType.MOVE;

  //#region packet-specific members
  tickId: number;
  time: number;
  newPosition: WorldPosData;
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
