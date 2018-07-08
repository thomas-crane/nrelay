import { Packet, PacketType } from '../../packet';

export class PasswordPromptPacket extends Packet {

    type = PacketType.PASSWORDPROMPT;

    //#region packet-specific members
    cleanPasswordStatus: number;
    //#endregion

    read(): void {
        this.cleanPasswordStatus = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.cleanPasswordStatus);
    }
}
