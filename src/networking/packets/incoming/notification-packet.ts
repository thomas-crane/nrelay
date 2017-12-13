import { Packet, PacketType } from '../../packet';

export class NotificationPacket extends Packet {

    public type = PacketType.NOTIFICATION;

    //#region packet-specific members
    objectId: number;
    message: string;
    color: number;
    //#endregion

    public read(): void {
        this.objectId = this.readInt32();
        this.message = this.readString();
        this.color = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.objectId);
        this.writeString(this.message);
        this.writeInt32(this.color);
    }
}
