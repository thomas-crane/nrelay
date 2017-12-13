import { Packet, PacketType } from '../../../packet';

export class DeletePetMessage extends Packet {

    public type = PacketType.DELETEPET;

    //#region packet-specific members
    petId: number;
    //#endregion

    public read(): void {
        this.petId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.petId);
    }
}
