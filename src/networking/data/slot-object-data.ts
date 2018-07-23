import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class SlotObjectData implements DataPacket {

  objectId: number;
  slotId: number;
  objectType: number;

  read(packet: PacketBuffer): void {
    this.objectId = packet.readInt32();
    this.slotId = packet.readUnsignedByte();
    this.objectType = packet.readUInt32();
  }

  write(packet: PacketBuffer): void {
    packet.writeInt32(this.objectId);
    packet.writeUnsignedByte(this.slotId);
    packet.writeInt32(this.objectType);
  }
}
