import { Packet, PacketType } from '../../packet';

export class CheckCreditsPacket extends Packet {

    type = PacketType.CHECKCREDITS;

    //#region packet-specific members

    //#endregion

    read(): void {

    }

    write(): void {

    }
}
