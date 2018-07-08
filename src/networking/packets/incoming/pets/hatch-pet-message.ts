import { Packet, PacketType } from '../../../packet';

export class HatchPetMessage extends Packet {

    type = PacketType.HATCHPET;

    //#region packet-specific members
    petName: string;
    petSkin: number;
    //#endregion

    read(): void {
        this.petName = this.readString();
        this.petSkin = this.readInt32();
    }

    write(): void {
        this.writeString(this.petName);
        this.writeInt32(this.petSkin);
    }
}
