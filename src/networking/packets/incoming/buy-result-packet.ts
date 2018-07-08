import { Packet, PacketType } from '../../packet';

export class BuyResultPacket extends Packet {

    type = PacketType.BUYRESULT;

    //#region packet-specific members
    result: number;
    resultString: string;
    //#endregion

    read(): void {
        this.result = this.readInt32();
        this.resultString = this.readString();
    }

    write(): void {
        this.writeInt32(this.result);
        this.writeString(this.resultString);
    }
}
