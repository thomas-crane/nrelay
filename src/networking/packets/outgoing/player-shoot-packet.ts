import { Packet, PacketType } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class PlayerShootPacket extends Packet {

    public type = PacketType.PLAYERSHOOT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    containerType: number;
    startingPos: WorldPosData;
    angle: number;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.containerType = this.readShort();
        this.startingPos = new WorldPosData();
        this.startingPos.read(this);
        this.angle = this.readFloat();
    }

    public write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeShort(this.containerType);
        this.startingPos.write(this);
        this.writeFloat(this.angle);
    }
}
