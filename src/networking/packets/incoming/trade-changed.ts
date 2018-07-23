import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class TradeChangedPacket implements IncomingPacket {

  type = PacketType.TRADECHANGED;

  //#region packet-specific members
  offer: boolean[];
  //#endregion

  read(buffer: PacketBuffer): void {
    const offerLen = buffer.readShort();
    this.offer = new Array<boolean>(offerLen);
    for (let i = 0; i < offerLen; i++) {
      this.offer[i] = buffer.readBoolean();
    }
  }
}
