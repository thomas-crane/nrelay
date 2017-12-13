import { Packet, PacketType } from '../../../packet';

export class HatchPetMessage extends Packet {

    public type = PacketType.HATCHPET;

    //#region packet-specific members
    petName: string;
    petSkin: number;
    //#endregion

    public read(): void {
        this.petName = this.readString();
        this.petSkin = this.readInt32();
    }

    public write(): void {
        this.writeString(this.petName);
        this.writeInt32(this.petSkin);
    }
}
