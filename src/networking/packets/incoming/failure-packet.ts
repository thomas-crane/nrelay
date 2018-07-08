import { Packet, PacketType } from '../../packet';

export class FailurePacket extends Packet {

    //#region error codes
    static INCORRECT_VERSION = 4;
    static BAD_KEY = 5;
    static INVALID_TELEPORT_TARGET = 6;
    static EMAIL_VERIFICATION_NEEDED = 7;
    static TELEPORT_REALM_BLOCK = 9;
    //#endregion

    type = PacketType.FAILURE;

    //#region packet-specific members
    errorId: number;
    errorDescription: string;
    //#endregion

    data: Buffer;

    read(): void {
        this.errorId = this.readInt32();
        this.errorDescription = this.readString();
    }

    write(): void {
        this.writeInt32(this.errorId);
        this.writeString(this.errorDescription);
    }
}
