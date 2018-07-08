import { Packet, PacketType } from '../../packet';

export class EnemyHitPacket extends Packet {

    type = PacketType.ENEMYHIT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    targetId: number;
    kill: boolean;
    //#endregion

    read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.targetId = this.readInt32();
        this.kill = this.readBoolean();
    }

    write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeInt32(this.targetId);
        this.writeBoolean(this.kill);
    }
}
