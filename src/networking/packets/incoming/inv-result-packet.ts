import { Packet, PacketType } from '../../packet';

export class InvResultPacket extends Packet {

    public type = PacketType.INVRESULT;

    //#region packet-specific members
    result: number;
    //#endregion

    public read(): void {
        this.result = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.result);
    }
}
