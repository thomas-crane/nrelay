import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class MoveRecord implements DataPacket {

  time: number;
  x: number;
  y: number;

  read(packet: PacketBuffer): void {
    this.time = packet.readInt32();
    this.x = packet.readFloat();
    this.y = packet.readFloat();
  }

  write(packet: PacketBuffer): void {
    packet.writeInt32(this.time);
    packet.writeFloat(this.x);
    packet.writeFloat(this.y);
  }

  clone(): MoveRecord {
    const clone = new MoveRecord();
    clone.time = this.time;
    clone.x = this.x;
    clone.y = this.y;
    return clone;
  }
}
