import { Packet, PacketType } from '../../packet';

export class BuyResultPacket extends Packet {

    public type = PacketType.BUYRESULT;

    //#region packet-specific members
    result: number;
    resultString: string;
    //#endregion

    public read(): void {
        this.result = this.readInt32();
        this.resultString = this.readString();
    }

    public write(): void {
        this.writeInt32(this.result);
        this.writeString(this.resultString);
    }
}
