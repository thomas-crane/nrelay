import { Packet, PacketType } from '../../packet';

export class FailurePacket extends Packet {

    public type = PacketType.FAILURE;

    //#region packet-specific members
    errorId: number;
    errorDescription: string;
    //#endregion

    data: Buffer;

    public read(): void {
        this.errorId = this.readInt32();
        this.errorDescription = this.readString();
    }

    public write(): void {
        this.writeInt32(this.errorId);
        this.writeString(this.errorDescription);
    }
}
