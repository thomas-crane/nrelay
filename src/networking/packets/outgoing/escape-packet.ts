import { Packet, PacketType } from '../../packet';

export class EscapePacket extends Packet {

    type = PacketType.ESCAPE;

    //#region packet-specific members

    //#endregion

    read(): void {

    }

    write(): void {

    }
}
