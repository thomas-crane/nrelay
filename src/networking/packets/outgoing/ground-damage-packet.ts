import { Packet, PacketType } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class GroundDamagePacket extends Packet {

    public type = PacketType.GROUNDDAMAGE;

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
