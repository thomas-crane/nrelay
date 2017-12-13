import { Packet, PacketType } from '../../packet';

export class NewAbilityMessage extends Packet {

    public type = PacketType.NEWABILITY;

    //#region packet-specific members
    abilityType: number;
    //#endregion

    public read(): void {
        this.abilityType = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.abilityType);
    }
}
