import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class AccountListPacket implements IncomingPacket {

  type = PacketType.ACCOUNTLIST;

  //#region packet-specific members
  accountListId: number;
  accountIds: string[];
  lockAction: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.accountListId = buffer.readInt32();
    const accountIdsLen = buffer.readShort();
    this.accountIds = new Array<string>(accountIdsLen);
    for (let i = 0; i < accountIdsLen; i++) {
      this.accountIds[i] = buffer.readString();
    }
    this.lockAction = buffer.readInt32();
  }
}
