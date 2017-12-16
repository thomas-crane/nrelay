import { Packet, PacketType } from '../../packet';

export class GoToQuestRoomPacket extends Packet {

    public type = PacketType.QUESTROOM_MSG;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
