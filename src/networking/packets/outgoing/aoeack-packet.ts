import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../../networking/data/world-pos-data';

export class AoeAckPacket extends Packet {

    public type = PacketType.AOEACK;

    //#region packet-specific members
    time: number;
    position: WorldPosData;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.position = new WorldPosData();
        this.position.read(this);
    }

    public write(): void {
        this.writeInt32(this.time);
        this.position.write(this);
    }
}
