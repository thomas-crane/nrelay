import { Packet, PacketType } from '../../packet';

export class TradeAcceptedPacket extends Packet {

    type = PacketType.TRADEACCEPTED;

    //#region packet-specific members
    clientOffer: boolean[];
    partnerOffer: boolean[];
    //#endregion

    read(): void {
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

    write(): void {
        for (const slot of this.clientOffer) {
            this.writeBoolean(slot);
        }
        for (const slot of this.partnerOffer) {
            this.writeBoolean(slot);
        }
    }
}
