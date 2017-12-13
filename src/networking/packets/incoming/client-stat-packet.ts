import { Packet, PacketType } from '../../packet';

export class ClientStatPacket extends Packet {

    public type = PacketType.CLIENTSTAT;

    //#region packet-specific members
    name: string;
    value: number;
    //#endregion

    public read(): void {
        this.name = this.readString();
        this.value = this.readInt32();
    }

    public write(): void {
        this.writeString(this.name);
        this.writeInt32(this.value);
    }
}
