import { Packet, PacketType } from '../../packet';

export class SetConditionPacket extends Packet {

    public type = PacketType.SETCONDITION;

    //#region packet-specific members
    conditionEffect: number;
    conditionDuration: number;
    //#endregion

    public read(): void {
        this.conditionEffect = this.readByte();
        this.conditionDuration = this.readFloat();
    }

    public write(): void {
        this.writeByte(this.conditionEffect);
        this.writeFloat(this.conditionDuration);
    }
}
