import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../../networking/data/world-pos-data';

export class GotoPacket extends Packet {

    type = PacketType.GOTO;

    //#region packet-specific members
    objectId: number;
    position: WorldPosData;
    //#endregion

    read(): void {
        this.objectId = this.readInt32();
        this.position = new WorldPosData();
        this.position.read(this);
    }

    write(): void {
        this.writeInt32(this.objectId);
        this.position.write(this);
    }
}
