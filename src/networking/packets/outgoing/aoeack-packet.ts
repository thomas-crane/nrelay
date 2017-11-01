import { Packet, PacketType } from '../../packet';

export class AoeAckPacket extends Packet {

    public type = PacketType.AoeAck;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
