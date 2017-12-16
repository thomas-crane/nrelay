import { Packet, PacketType } from '../../../packet';

export class ActivePetUpdateRequestPacket extends Packet {

    public type = PacketType.ACTIVEPET_UPDATE_REQUEST;

    //#region packet-specific members
    commandType: number;
    instanceId: number;
    //#endregion

    public read(): void {
        this.commandType = this.readByte();
        this.instanceId = this.readInt32();
    }

    public write(): void {
        this.writeByte(this.commandType);
        this.writeInt32(this.instanceId);
    }
}
