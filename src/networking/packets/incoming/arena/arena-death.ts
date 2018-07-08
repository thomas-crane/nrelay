import { Packet, PacketType } from '../../../packet';

export class ArenaDeathPacket extends Packet {

    type = PacketType.ARENADEATH;

    //#region packet-specific members
    cost: number;
    //#endregion

    read(): void {
        this.cost = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.cost);
    }
}
