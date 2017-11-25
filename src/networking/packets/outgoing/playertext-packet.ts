import { Packet, PacketType } from '../../packet';

export class PlayerTextPacket extends Packet {

    public type = PacketType.PLAYERTEXT;

    //#region packet-specific members
    text: string;
    //#endregion

    public read(): void {
        this.text = this.readString();
    }

    public write(): void {
        this.writeString(this.text);
    }
}
