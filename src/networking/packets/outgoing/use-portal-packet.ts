import { Packet, PacketType } from '../../packet';

export class UsePortalPacket extends Packet {

    public type = PacketType.USEPORTAL;

    //#region packet-specific members
    objectId: number;
    //#endregion

    public read(): void {
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.objectId);
    }
}
