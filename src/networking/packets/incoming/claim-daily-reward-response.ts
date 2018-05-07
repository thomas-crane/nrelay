import { Packet, PacketType } from '../../packet';

export class ClaimDailyRewardResponse extends Packet {

    public type = PacketType.LOGINREWARD_MSG;

    //#region packet-specific members
    itemId: number;
    quantity: number;
    gold: number;
    //#endregion

    public read(): void {
        this.itemId = this.readInt32();
        this.quantity = this.readInt32();
        this.gold = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.itemId);
        this.writeInt32(this.quantity);
        this.writeInt32(this.gold);
    }
}
