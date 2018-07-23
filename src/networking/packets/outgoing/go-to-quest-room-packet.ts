import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class GoToQuestRoomPacket implements OutgoingPacket {

  type = PacketType.QUESTROOM_MSG;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
