import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { ObjectStatusData } from '../../data/object-status-data';

export class NewTickPacket implements IncomingPacket {

  type = PacketType.NEWTICK;

  //#region packet-specific members
  tickId: number;
  tickTime: number;
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
