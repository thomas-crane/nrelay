import { Packet, PacketType } from '../../packet';

export class ShootAckPacket extends Packet {

    public type = PacketType.ShootAck;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
