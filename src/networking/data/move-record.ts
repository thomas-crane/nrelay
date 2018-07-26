/**
 * @module networking/data
 */
import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class MoveRecord implements DataPacket {

  /**
   * The client time of this move record.
   */
  time: number;
  /**
   * The X coordinate of this move record.
   */
  x: number;
  /**
   * The Y coordinate of this move record.
   */
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
