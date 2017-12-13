import { Packet } from './../packet';

export class SlotObjectData {

    objectId: number;
    slotId: number;
    objectType: number;

    public read(packet: Packet): void {
        this.objectId = packet.readInt32();
        this.slotId = packet.readUnsignedByte();
        this.objectType = packet.readUInt32();
    }

    public write(packet: Packet): void {
        packet.writeInt32(this.objectId);
        packet.writeUnsigedByte(this.slotId);
        packet.writeInt32(this.objectType);
    }
}
