import { Packet, PacketType } from '../../packet';

export class ReskinUnlockPacket extends Packet {

    type = PacketType.RESKINUNLOCK;

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
