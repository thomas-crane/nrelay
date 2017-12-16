import { Packet, PacketType } from '../../packet';

export class EscapePacket extends Packet {

    public type = PacketType.ESCAPE;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
