import { Packet, PacketType } from '../../packet';

export class EditAccountListPacket extends Packet {

    type = PacketType.EDITACCOUNTLIST;

    //#region packet-specific members
    accountListId: number;
    add: boolean;
    objectId: number;
    //#endregion

    read(): void {
        this.accountListId = this.readInt32();
        this.add = this.readBoolean();
        this.objectId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.accountListId);
        this.writeBoolean(this.add);
        this.writeInt32(this.objectId);
    }
}
