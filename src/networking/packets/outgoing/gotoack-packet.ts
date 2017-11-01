import { Packet, PacketType } from '../../packet';

export class GotoAckPacket extends Packet {

    public type = PacketType.GotoAck;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
