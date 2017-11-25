import { Packet, PacketType } from '../../packet';

export class TradeChangedPacket extends Packet {

    public type = PacketType.TRADECHANGED;

    //#region packet-specific members
    offer: boolean[];
    //#endregion

    public read(): void {
        const offerLen = this.readShort();
        this.offer = new Array<boolean>(offerLen);
        for (let i = 0; i < offerLen; i++) {
            this.offer[i] = this.readBoolean();
        }
    }

    public write(): void {
        this.writeShort(this.offer.length);
        for (let i = 0; i < this.offer.length; i++) {
            this.writeBoolean(this.offer[i]);
        }
    }
}
