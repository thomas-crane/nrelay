import { Packet } from './../packet';
import { ObjectStatusData } from './object-status-data';

export class ObjectData {
    objectType: number;
    status: ObjectStatusData;

    public read(packet: Packet): void {
        this.objectType = packet.readUnsignedShort();
        this.status = new ObjectStatusData();
        this.status.read(packet);
    }

    public write(packet: Packet): void {
        packet.writeUnsignedShort(this.objectType);
        this.status.write(packet);
    }
}
