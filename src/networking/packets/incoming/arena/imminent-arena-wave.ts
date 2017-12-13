import { Packet, PacketType } from '../../../packet';

export class ImminentArenaWavePacket extends Packet {

    public type = PacketType.IMMINENTARENA_WAVE;

    //#region packet-specific members
    currentRuntime: number;
    //#endregion

    public read(): void {
        this.currentRuntime = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.currentRuntime);
    }
}
