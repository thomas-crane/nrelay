import { Packet, PacketType } from '../../packet';

export class ShootAckPacket extends Packet {

    public type = PacketType.SHOOTACK;

    //#region packet-specific members
    time: number;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.time);
    }
}
