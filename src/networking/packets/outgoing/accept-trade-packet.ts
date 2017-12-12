import { Packet, PacketType } from '../../packet';

export class AcceptTradePacket extends Packet {

    public type = PacketType.ACCEPTTRADE;

    //#region packet-specific members
    clientOffer: boolean[];
    partnerOffer: boolean[];
    //#endregion

    public read(): void {
        const clientOfferLen = this.readShort();
        this.clientOffer = new Array<boolean>(clientOfferLen);
        for (let i = 0; i < clientOfferLen; i++) {
            this.clientOffer[i] = this.readBoolean();
        }
        const partnerOfferLen = this.readShort();
        this.partnerOffer = new Array<boolean>(partnerOfferLen);
        for (let i = 0; i < partnerOfferLen; i++) {
            this.partnerOffer[i] = this.readBoolean();
        }
    }

    public write(): void {
        this.writeShort(this.clientOffer.length);
        for (let i = 0; i < this.clientOffer.length; i++) {
            this.writeBoolean(this.clientOffer[i]);
        }
        this.writeShort(this.partnerOffer.length);
        for (let i = 0; i < this.partnerOffer.length; i++) {
            this.writeBoolean(this.partnerOffer[i]);
        }
    }
}
