import { Packet, PacketType } from '../../packet';

export class GoToQuestRoomPacket extends Packet {

    type = PacketType.QUESTROOM_MSG;

    //#region packet-specific members

    //#endregion

    read(): void {

    }

    write(): void {

    }
}
