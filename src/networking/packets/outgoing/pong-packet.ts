import { Packet, PacketType } from '../../packet';

export class PongPacket extends Packet {

    type = PacketType.PONG;

    //#region packet-specific members
    serial: number;
    time: number;
    //#endregion

    read(): void {
        this.serial = this.readInt32();
        this.time = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.serial);
        this.writeInt32(this.time);
    }
}
