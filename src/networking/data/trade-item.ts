import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';

export class TradeItem implements DataPacket {

  item: number;
  slotType: number;
  tradeable: boolean;
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
