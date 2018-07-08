import { Packet, PacketType } from '../../packet';

export class NewAbilityMessage extends Packet {

    type = PacketType.NEWABILITY;

    //#region packet-specific members
    abilityType: number;
    //#endregion

    read(): void {
        this.abilityType = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.abilityType);
    }
}
