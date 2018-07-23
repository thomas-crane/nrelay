import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

export class ImminentArenaWavePacket implements IncomingPacket {

  type = PacketType.IMMINENTARENA_WAVE;

  //#region packet-specific members
  currentRuntime: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.currentRuntime = buffer.readInt32();
  }
}
