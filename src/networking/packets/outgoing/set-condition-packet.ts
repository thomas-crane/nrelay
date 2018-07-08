import { Packet, PacketType } from '../../packet';

export class SetConditionPacket extends Packet {

    type = PacketType.SETCONDITION;

    //#region packet-specific members
    conditionEffect: number;
    conditionDuration: number;
    //#endregion

    read(): void {
        this.conditionEffect = this.readByte();
        this.conditionDuration = this.readFloat();
    }

    write(): void {
        this.writeByte(this.conditionEffect);
        this.writeFloat(this.conditionDuration);
    }
}
