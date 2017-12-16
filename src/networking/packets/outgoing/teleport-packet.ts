import { Packet, PacketType } from '../../packet';

export class TeleportPacket extends Packet {

    public type = PacketType.TELEPORT;

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
