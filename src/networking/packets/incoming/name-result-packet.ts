import { Packet, PacketType } from '../../packet';

export class NameResultPacket extends Packet {

    type = PacketType.NAMERESULT;

    //#region packet-specific members
    success: boolean;
    errorText: string;
    //#endregion

    read(): void {
        this.success = this.readBoolean();
        this.errorText = this.readString();
    }

    write(): void {
        this.writeBoolean(this.success);
        this.writeString(this.errorText);
    }
}
