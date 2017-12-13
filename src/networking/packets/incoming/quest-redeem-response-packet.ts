import { Packet, PacketType } from '../../packet';

export class QuestRedeemResponsePacket extends Packet {

    public type = PacketType.QUESTREDEEM_RESPONSE;

    //#region packet-specific members
    ok: boolean;
    message: string;
    //#endregion

    public read(): void {
        this.ok = this.readBoolean();
        this.message = this.readString();
    }

    public write(): void {
        this.writeBoolean(this.ok);
        this.writeString(this.message);
    }
}
