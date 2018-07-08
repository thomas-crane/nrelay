import { Packet, PacketType } from '../../packet';

export class ClientStatPacket extends Packet {

    type = PacketType.CLIENTSTAT;

    //#region packet-specific members
    name: string;
    value: number;
    //#endregion

    read(): void {
        this.name = this.readString();
        this.value = this.readInt32();
    }

    write(): void {
        this.writeString(this.name);
        this.writeInt32(this.value);
    }
}
