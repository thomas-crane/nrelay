import { Packet, PacketType } from '../../packet';

export class QuestRedeemResponsePacket extends Packet {

    type = PacketType.QUESTREDEEM_RESPONSE;

    //#region packet-specific members
    ok: boolean;
    message: string;
    //#endregion

    read(): void {
        this.ok = this.readBoolean();
        this.message = this.readString();
    }

    write(): void {
        this.writeBoolean(this.ok);
        this.writeString(this.message);
    }
}
