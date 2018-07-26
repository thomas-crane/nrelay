/**
 * @module networking/data
 */
import { PacketBuffer } from '../packet-buffer';
import { DataPacket } from '../packet';
import { StatType } from '../../models/stat-type';

export class StatData implements DataPacket {
  /**
   * The type of stat.
   */
  statType = 0;
  /**
   * The number value of this stat, if this is not a string stat.
   */
  statValue: number;
  /**
   * The string value of this stat, if this is a string stat.
   */
  stringStatValue: string;

  read(packet: PacketBuffer): void {
    this.statType = packet.readUnsignedByte();
    if (this.isStringStat()) {
      this.stringStatValue = packet.readString();
    } else {
      this.statValue = packet.readInt32();
    }
  }

  write(packet: PacketBuffer): void {
    packet.writeByte(this.statType);
    if (this.isStringStat()) {
      packet.writeString(this.stringStatValue);
    } else {
      packet.writeInt32(this.statValue);
    }
  }

  private isStringStat(): boolean {
    switch (this.statType) {
      case StatType.NAME_STAT:
      case StatType.GUILD_NAME_STAT:
      case StatType.PET_NAME_STAT:
      case StatType.ACCOUNT_ID_STAT:
      case StatType.OWNER_ACCOUNT_ID_STAT:
        return true;
      default:
        return false;
    }
  }
}
