import { Packet, PacketType } from '../../packet';

export class ChangeTradePacket extends Packet {

    type = PacketType.CHANGETRADE;

    //#region packet-specific members
    offer: boolean[];
    //#endregion

    read(): void {
        const offerLen = this.readShort();
        this.offer = new Array<boolean>(offerLen);
        for (let i = 0; i < offerLen; i++) {
            this.offer[i] = this.readBoolean();
        }
    }

    write(): void {
        this.writeShort(this.offer.length);
        for (const slot of this.offer) {
            this.writeBoolean(slot);
        }
    }
}
