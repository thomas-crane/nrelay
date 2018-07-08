import { Packet, PacketType } from '../../packet';

export class InvResultPacket extends Packet {

    type = PacketType.INVRESULT;

    //#region packet-specific members
    result: number;
    //#endregion

    read(): void {
        this.result = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.result);
    }
}
