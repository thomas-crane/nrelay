import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class GroundTileData implements DataPacket {

  x: number;
  y: number;
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
