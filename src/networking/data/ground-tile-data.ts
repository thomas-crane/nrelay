/**
 * @module networking/data
 */
import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class GroundTileData implements DataPacket {

  /**
   * The X coordinate of this tile.
   */
  x: number;
  /**
   * The Y coordinate of this tile.
   */
  y: number;
  /**
   * The tile type of this tile.
   */
  type: number;

  read(packet: PacketBuffer): void {
    this.x = packet.readShort();
    this.y = packet.readShort();
    this.type = packet.readUnsignedShort();
  }

  write(packet: PacketBuffer): void {
    packet.writeShort(this.x);
    packet.writeShort(this.y);
    packet.writeUnsignedShort(this.type);
  }
}
