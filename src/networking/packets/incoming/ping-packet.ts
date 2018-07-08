import { Packet, PacketType } from '../../packet';

export class PingPacket extends Packet {

    type = PacketType.PING;

    //#region packet-specific members
    serial: number;
    //#endregion

    read(): void {
        this.serial = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.serial);
    }
}
