import { Packet, PacketType } from '../../packet';

export class PasswordPromptPacket extends Packet {

    public type = PacketType.PASSWORDPROMPT;

    //#region packet-specific members
    cleanPasswordStatus: number;
    //#endregion

    public read(): void {
        this.cleanPasswordStatus = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.cleanPasswordStatus);
    }
}
