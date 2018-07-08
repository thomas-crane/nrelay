import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../../networking/data/world-pos-data';

export class ServerPlayerShootPacket extends Packet {

    type = PacketType.SERVERPLAYERSHOOT;

    //#region packet-specific members
    bulletId: number;
    ownerId: number;
    containerType: number;
    startingPos: WorldPosData;
    angle: number;
    damage: number;
    //#endregion

    read(): void {
        this.bulletId = this.readUnsignedByte();
        this.ownerId = this.readInt32();
        this.containerType = this.readInt32();
        this.startingPos = new WorldPosData();
        this.startingPos.read(this);
        this.angle = this.readFloat();
        this.damage = this.readShort();
    }

    write(): void {
        this.writeUnsignedByte(this.bulletId);
        this.writeInt32(this.ownerId);
        this.writeInt32(this.containerType);
        this.startingPos.write(this);
        this.writeFloat(this.angle);
        this.writeInt32(this.damage);
    }
}
