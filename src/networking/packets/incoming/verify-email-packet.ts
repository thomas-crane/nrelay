import { Packet, PacketType } from '../../packet';

export class VerifyEmailPacket extends Packet {

    type = PacketType.VERIFYEMAIL;

    //#region packet-specific members

    //#endregion

    read(): void {

    }

    write(): void {

    }
}
