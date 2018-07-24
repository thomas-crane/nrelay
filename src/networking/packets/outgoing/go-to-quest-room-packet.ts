import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

/**
 * Sent to prompt the server to send a `ReconnectPacket` which
 * contains the reconnect information for the Quest Room.
 */
export class GoToQuestRoomPacket implements OutgoingPacket {

  type = PacketType.QUESTROOM_MSG;

  //#region packet-specific members

  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
