import { Packet, PacketType } from '../../../packet';

export class DeletePetMessage extends Packet {

    type = PacketType.DELETEPET;

    //#region packet-specific members
    petId: number;
    //#endregion

    read(): void {
        this.petId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.petId);
    }
}
