import { Packet, PacketType } from '../../packet';

export class ReskinUnlockPacket extends Packet {

    public type = PacketType.RESKINUNLOCK;

    //#region packet-specific members
    skinId: number;
    //#endregion

    public read(): void {
        this.skinId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.skinId);
    }
}
