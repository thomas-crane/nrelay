import { Packet, PacketType } from '../../packet';

export class ClaimDailyRewardMessage extends Packet {

    public type = PacketType.CLAIMLOGIN_REWARD_MSG;

    //#region packet-specific members
    claimKey: string;
    claimType: string;
    //#endregion

    public read(): void {
        this.claimKey = this.readString();
        this.claimType = this.readString();
    }

    public write(): void {
        this.writeString(this.claimKey);
        this.writeString(this.claimType);
    }
}
