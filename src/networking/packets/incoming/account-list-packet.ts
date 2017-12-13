import { Packet, PacketType } from '../../packet';

export class AccountListPacket extends Packet {

    public type = PacketType.ACCOUNTLIST;

    //#region packet-specific members
    accountListId: number;
    accountIds: string[];
    lockAction: number;
    //#endregion

    public read(): void {
        this.accountListId = this.readInt32();
        const accountIdsLen = this.readShort();
        this.accountIds = new Array<string>(accountIdsLen);
        for (let i = 0; i < accountIdsLen; i++) {
            this.accountIds[i] = this.readString();
        }
        this.lockAction = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.accountListId);
        this.writeShort(this.accountIds.length);
        for (let i = 0; i < this.accountIds.length; i++) {
            this.writeString(this.accountIds[i]);
        }
        this.writeInt32(this.lockAction);
    }
}
