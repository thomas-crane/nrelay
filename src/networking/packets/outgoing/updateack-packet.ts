import { Packet, PacketType } from '../../packet';

export class UpdateAckPacket extends Packet {

    type = PacketType.UPDATEACK;

    //#region packet-specific members

    //#endregion

    read(): void {

    }

    write(): void {

    }
}
