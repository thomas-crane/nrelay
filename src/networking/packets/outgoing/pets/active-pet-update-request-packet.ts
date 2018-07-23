import { PacketBuffer } from '../../../packet-buffer';
import { PacketType } from '../../../packet-type';
import { OutgoingPacket } from '../../../packet';

export class ActivePetUpdateRequestPacket implements OutgoingPacket {

  type = PacketType.ACTIVEPET_UPDATE_REQUEST;

  //#region packet-specific members
  commandType: number;
  instanceId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeByte(this.commandType);
    buffer.writeInt32(this.instanceId);
  }
}
