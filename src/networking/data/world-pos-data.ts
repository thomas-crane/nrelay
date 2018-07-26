/**
 * @module networking/data
 */
import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';
import { Point } from '../../services';

export class WorldPosData implements DataPacket {

  /**
   * The X coordinate of this position.
   */
  x: number;
  /**
   * The Y coordinate of this position.
   */
  y: number;

  constructor(x?: number, y?: number) {
    this.x = x || null;
    this.y = y || null;
  }

  read(packet: PacketBuffer): void {
    this.x = packet.readFloat();
    this.y = packet.readFloat();
  }

  write(packet: PacketBuffer): void {
    packet.writeFloat(this.x);
    packet.writeFloat(this.y);
  }

  /**
   * Returns the distance, squared, between this position and the `location`.
   * @param location The other location.
   */
  squareDistanceTo(location: WorldPosData | Point): number {
    const a = location.x - this.x;
    const b = location.y - this.y;
    return a ** 2 + b ** 2;
  }

  /**
   * Returns a new `WorldPosData` object with the same X/Y coordinates.
   */
  clone(): WorldPosData {
    const clone = new WorldPosData();
    clone.x = this.x;
    clone.y = this.y;
    return clone;
  }

  /**
   * Returns a `Point` with the same X/Y coordinates.
   */
  toPrecisePoint(): Point {
    return {
      x: this.x,
      y: this.y
    };
  }

  /**
   * Returns a `Point` with the floored X/Y coordinates.
   */
  toPoint(): Point {
    return {
      x: Math.floor(this.x),
      y: Math.floor(this.y)
    };
  }
}
