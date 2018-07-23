import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../data/world-pos-data';
import { MoveRecord } from './../../data/move-record';

export class MovePacket extends Packet {

    type = PacketType.MOVE;

    //#region packet-specific members
    tickId: number;
    time: number;
    newPosition: WorldPosData;
    records: MoveRecord[];
    //#endregion

    read(): void {
        this.tickId = this.readInt32();
        this.time = this.readInt32();
        this.newPosition = new WorldPosData();
        this.newPosition.read(this);
        const recordLen = this.readShort();
        this.records = new Array<MoveRecord>(recordLen);
        for (let i = 0; i < recordLen; i++) {
            const mr = new MoveRecord();
            mr.read(this);
        }
    }

    write(): void {
        this.writeInt32(this.tickId);
        this.writeInt32(this.time);
        this.newPosition.write(this);
        this.records = [];
        this.writeShort(this.records.length);
        for (const record of this.records) {
            record.write(this);
        }
    }
}
