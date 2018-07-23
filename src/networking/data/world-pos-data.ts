import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';
import { Point } from '../../services';

export class WorldPosData implements DataPacket {

  x: number;
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

  squareDistanceTo(location: WorldPosData | Point): number {
    const a = location.x - this.x;
    const b = location.y - this.y;
    return a ** 2 + b ** 2;
  }

  clone(): WorldPosData {
    const clone = new WorldPosData();
    clone.x = this.x;
    clone.y = this.y;
    return clone;
  }

  toPrecisePoint(): Point {
    return {
      x: this.x,
      y: this.y
    };
  }

  toPoint(): Point {
    return {
      x: Math.floor(this.x),
      y: Math.floor(this.y)
    };
  }
}
