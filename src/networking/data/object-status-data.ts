import { Packet } from './../packet';
import { WorldPosData } from './world-pos-data';
import { StatData } from './stat-data';

export class ObjectStatusData {

    objectId: number;
    pos: WorldPosData;
    stats: StatData[];

    public read(packet: Packet): void {
        this.objectId = packet.readInt32();
        this.pos = new WorldPosData();
        this.pos.read(packet);
        const statLen = packet.readShort();
        this.stats = new Array(statLen);
        for (let i = 0; i < statLen; i++) {
            const sd = new StatData();
            sd.read(packet);
            this.stats[i] = sd;
        }
    }

    public write(packet: Packet): void {
        packet.writeInt32(this.objectId);
        this.pos.write(packet);
        packet.writeShort(this.stats.length);
        for (let i = 0; i < this.stats.length; i++) {
            this.stats[i].write(packet);
        }
    }
}
