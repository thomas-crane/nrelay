import { Packet, PacketType } from '../../packet';

export class UpdateAckPacket extends Packet {

    public type = PacketType.UPDATEACK;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
