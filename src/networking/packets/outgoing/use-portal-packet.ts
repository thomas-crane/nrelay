import { Packet, PacketType } from '../../packet';

export class UsePortalPacket extends Packet {

    type = PacketType.USEPORTAL;

    //#region packet-specific members
    objectId: number;
    //#endregion

    read(): void {
        this.objectId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.objectId);
    }
}
