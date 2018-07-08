import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../data/world-pos-data';

export class EnemyShootPacket extends Packet {

    type = PacketType.ENEMYSHOOT;

    //#region packet-specific members
    bulletId: number;
    ownerId: number;
    bulletType: number;
    startingPos: WorldPosData;
    angle: number;
    damage: number;
    numShots: number;
    angleInc: number;
    //#endregion

    read(): void {
        this.bulletId = this.readUnsignedByte();
        this.ownerId = this.readInt32();
        this.bulletType = this.readUnsignedByte();
        this.startingPos = new WorldPosData();
        this.startingPos.read(this);
        this.angle = this.readFloat();
        this.damage = this.readShort();
        if (this.bufferIndex < this.data.length) {
            this.numShots = this.readUnsignedByte();
            this.angleInc = this.readFloat();
        } else {
            this.numShots = 1;
            this.angleInc = 0;
        }
    }

    write(): void {
        this.writeUnsignedByte(this.bulletId);
        this.writeInt32(this.ownerId);
        this.writeUnsignedByte(this.bulletType);
        this.startingPos.write(this);
        this.writeFloat(this.angle);
        this.writeShort(this.damage);
        if (this.numShots !== 1) {
            this.writeUnsignedByte(this.numShots);
        }
        if (this.angleInc !== 0) {
            this.writeFloat(this.angleInc);
        }
    }
}
