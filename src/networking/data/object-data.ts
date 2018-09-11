/**
 * @module networking/data
 */
import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';
import { ObjectStatusData } from './object-status-data';

export class ObjectData implements DataPacket {
  /**
   * The type of this object.
   */
  objectType: number;
  /**
   * The status of this object.
   */
  status: ObjectStatusData;

  read(packet: PacketBuffer): void {
    this.objectType = packet.readUnsignedShort();
    this.status = new ObjectStatusData();
    this.status.read(packet);
  }

  write(packet: PacketBuffer): void {
    packet.writeUnsignedShort(this.objectType);
    this.status.write(packet);
  }
}
