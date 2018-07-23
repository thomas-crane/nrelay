import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class DeathPacket implements IncomingPacket {

  type = PacketType.DEATH;

  //#region packet-specific members
  accountId: string;
  charId: number;
  killedBy: string;
  zombieId: number;
  zombieType: number;
  isZombie: boolean;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.accountId = buffer.readString();
    this.charId = buffer.readInt32();
    this.killedBy = buffer.readString();
    this.zombieType = buffer.readInt32();
    this.zombieId = buffer.readInt32();
    this.isZombie = this.zombieId !== -1;
  }
}
