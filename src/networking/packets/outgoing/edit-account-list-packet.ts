import { Packet, PacketType } from '../../packet';

export class EditAccountListPacket extends Packet {

    public type = PacketType.EDITACCOUNTLIST;

    //#region packet-specific members
    accountListId: number;
    add: boolean;
    objectId: number;
    //#endregion

    public read(): void {
        this.accountListId = this.readInt32();
        this.add = this.readBoolean();
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.accountListId);
        this.writeBoolean(this.add);
        this.writeInt32(this.objectId);
    }
}
