import { Packet, PacketType } from '../../packet';

export class GlobalNotificationPacket extends Packet {

    type = PacketType.GLOBALNOTIFICATION;

    //#region packet-specific members
    notificationType: number;
    text: string;
    //#endregion

    read(): void {
        this.notificationType = this.readInt32();
        this.text = this.readString();
    }

    write(): void {
        this.writeInt32(this.notificationType);
        this.writeString(this.text);
    }
}
