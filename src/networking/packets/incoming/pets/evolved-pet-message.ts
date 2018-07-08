import { Packet, PacketType } from '../../../packet';

export class EvolvedPetMessage extends Packet {

    type = PacketType.EVOLVEPET;

    //#region packet-specific members
    petId: number;
    initialSkin: number;
    finalSkin: number;
    //#endregion

    read(): void {
        this.petId = this.readInt32();
        this.initialSkin = this.readInt32();
        this.finalSkin = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.petId);
        this.writeInt32(this.initialSkin);
        this.writeInt32(this.finalSkin);
    }
}
