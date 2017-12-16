import { Packet, PacketType } from '../../packet';

export class CheckCreditsPacket extends Packet {

    public type = PacketType.CHECKCREDITS;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
