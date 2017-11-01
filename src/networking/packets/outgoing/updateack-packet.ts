import { Packet, PacketType } from '../../packet';

export class UpdateAckPacket extends Packet {

    public type = PacketType.UpdateAck;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
