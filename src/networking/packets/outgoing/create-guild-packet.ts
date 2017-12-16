import { Packet, PacketType } from '../../packet';

export class CreateGuildPacket extends Packet {

    public type = PacketType.CREATEGUILD;

    //#region packet-specific members
    name: string;
    //#endregion

    public read(): void {
        this.name = this.readString();
    }

    public write(): void {
        this.writeString(this.name);
    }
}
