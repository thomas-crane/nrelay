import { Packet, PacketType } from '../../packet';

export class NameResultPacket extends Packet {

    public type = PacketType.NAMERESULT;

    //#region packet-specific members
    success: boolean;
    errorText: string;
    //#endregion

    public read(): void {
        this.success = this.readBoolean();
        this.errorText = this.readString();
    }

    public write(): void {
        this.writeBoolean(this.success);
        this.writeString(this.errorText);
    }
}
