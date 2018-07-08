import { Packet, PacketType } from '../../packet';

export class NotificationPacket extends Packet {

    type = PacketType.NOTIFICATION;

    //#region packet-specific members
    objectId: number;
    message: string;
    color: number;
    //#endregion

    read(): void {
        this.objectId = this.readInt32();
        this.message = this.readString();
        this.color = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.objectId);
        this.writeString(this.message);
        this.writeInt32(this.color);
    }
}
