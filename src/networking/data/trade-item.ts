import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class TradeItem implements DataPacket {

  /**
   * The item id.
   */
  item: number;
  /**
   * Unknown.
   */
  slotType: number;
  /**
   * Whether or not the item is tradeable.
   */
  tradeable: boolean;
  /**
   * Whether or not the item is included in an active trade.
   */
  included: boolean;

  read(packet: PacketBuffer): void {
    this.item = packet.readInt32();
    this.slotType = packet.readInt32();
    this.tradeable = packet.readBoolean();
    this.included = packet.readBoolean();
  }

  write(packet: PacketBuffer): void {
    packet.writeInt32(this.item);
    packet.writeInt32(this.slotType);
    packet.writeBoolean(this.tradeable);
    packet.writeBoolean(this.included);
  }
}
