import { Packet, PacketType } from '../../packet';

export class PongPacket extends Packet {

    public type = PacketType.PONG;

    //#region packet-specific members
    serial: number;
    time: number;
    //#endregion

    public read(): void {
        this.serial = this.readInt32();
        this.time = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.serial);
        this.writeInt32(this.time);
    }
}
