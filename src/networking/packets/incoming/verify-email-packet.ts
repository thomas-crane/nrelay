import { Packet, PacketType } from '../../packet';

export class VerifyEmailPacket extends Packet {

    public type = PacketType.VERIFYEMAIL;

    //#region packet-specific members

    //#endregion

    public read(): void {

    }

    public write(): void {

    }
}
