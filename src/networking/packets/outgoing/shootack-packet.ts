import { Packet, PacketType } from '../../packet';

export class ShootAckPacket extends Packet {

    type = PacketType.SHOOTACK;

    //#region packet-specific members
    time: number;
    //#endregion

    read(): void {
        this.time = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.time);
    }
}
