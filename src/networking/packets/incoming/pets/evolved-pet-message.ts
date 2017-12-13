import { Packet, PacketType } from '../../../packet';

export class EvolvedPetMessage extends Packet {

    public type = PacketType.EVOLVEPET;

    //#region packet-specific members
    petId: number;
    initialSkin: number;
    finalSkin: number;
    //#endregion

    public read(): void {
        this.petId = this.readInt32();
        this.initialSkin = this.readInt32();
        this.finalSkin = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.petId);
        this.writeInt32(this.initialSkin);
        this.writeInt32(this.finalSkin);
    }
}
