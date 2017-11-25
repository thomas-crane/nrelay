import { Packet, PacketType } from '../../packet';

export class PingPacket extends Packet {

    public type = PacketType.PING;

    //#region packet-specific members
    serial: number;
    //#endregion

    public read(): void {
        this.serial = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.serial);
    }
}
