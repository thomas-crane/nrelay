import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { IncomingPacket } from '../../../packet';

/**
 * Received when a new arena wave is about to begin.
 */
export class ImminentArenaWavePacket implements IncomingPacket {

  type = PacketType.IMMINENTARENA_WAVE;
  propagate = true;

  //#region packet-specific members
  /**
   * The length of time the player has been in the arena for.
   */
  currentRuntime: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.currentRuntime = buffer.readInt32();
  }
}
