import { Packet, PacketType } from '../../packet';

export class TradeDonePacket extends Packet {

    type = PacketType.TRADEDONE;

    //#region packet-specific members
    code: TradeResult;
    description: string;
    //#endregion

    read(): void {
        this.code = this.readInt32();
        this.description = this.readString();
    }

    write(): void {
        this.writeInt32(this.code);
        this.writeString(this.description);
    }
}

export enum TradeResult {
    Successful = 0,
    PlayerCanceled = 1
}
