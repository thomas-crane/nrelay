import { Packet, PacketType } from '../../packet';

export class ClaimDailyRewardMessage extends Packet {

    type = PacketType.CLAIMLOGIN_REWARD_MSG;

    //#region packet-specific members
    claimKey: string;
    claimType: string;
    //#endregion

    read(): void {
        this.claimKey = this.readString();
        this.claimType = this.readString();
    }

    write(): void {
        this.writeString(this.claimKey);
        this.writeString(this.claimType);
    }
}
