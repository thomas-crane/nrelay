import { Packet, PacketType } from '../../packet';

export class ChangeTradePacket extends Packet {

    public type = PacketType.CHANGETRADE;

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
