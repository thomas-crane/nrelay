import { Packet, PacketType } from '../../packet';

export class TeleportPacket extends Packet {

    type = PacketType.TELEPORT;

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
