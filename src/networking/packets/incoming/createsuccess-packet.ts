import { Packet, PacketType } from '../../packet';

export class CreateSuccessPacket extends Packet {

    public type = PacketType.CREATESUCCESS;

    //#region packet-specific members
    objectId: number;
    charId: number;
    //#endregion

    data: Buffer;

    public read(): void {
        this.objectId = this.readInt32();
        this.charId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.objectId);
        this.writeInt32(this.charId);
    }
}
