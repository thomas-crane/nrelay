import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../../networking/data/world-pos-data';

export class GotoPacket extends Packet {

    public type = PacketType.GOTO;

    //#region packet-specific members
    objectId: number;
    position: WorldPosData;
    //#endregion

    public read(): void {
        this.objectId = this.readInt32();
        this.position = new WorldPosData();
        this.position.read(this);
    }

    public write(): void {
        this.writeInt32(this.objectId);
        this.position.write(this);
    }
}
