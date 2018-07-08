import { Packet, PacketType } from '../../../packet';

export class ImminentArenaWavePacket extends Packet {

    type = PacketType.IMMINENTARENA_WAVE;

    //#region packet-specific members
    currentRuntime: number;
    //#endregion

    read(): void {
        this.currentRuntime = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.currentRuntime);
    }
}
