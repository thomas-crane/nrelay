import { Packet, PacketType } from '../../packet';

export class ReskinPacket extends Packet {

    type = PacketType.RESKIN;

    //#region packet-specific members
    skinId: number;
    //#endregion

    read(): void {
        this.skinId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.skinId);
    }
}
