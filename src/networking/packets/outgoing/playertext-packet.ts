import { Packet, PacketType } from '../../packet';

export class PlayerTextPacket extends Packet {

    type = PacketType.PLAYERTEXT;

    //#region packet-specific members
    text: string;
    //#endregion

    read(): void {
        this.text = this.readString();
    }

    write(): void {
        this.writeString(this.text);
    }
}
