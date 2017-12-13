import { Packet, PacketType } from '../../../packet';

export class ArenaDeathPacket extends Packet {

    public type = PacketType.ARENADEATH;

    //#region packet-specific members
    cost: number;
    //#endregion

    public read(): void {
        this.cost = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.cost);
    }
}
