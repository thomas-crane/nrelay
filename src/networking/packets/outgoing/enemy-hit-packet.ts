import { Packet, PacketType } from '../../packet';

export class EnemyHitPacket extends Packet {

    public type = PacketType.ENEMYHIT;

    //#region packet-specific members
    time: number;
    bulletId: number;
    targetId: number;
    kill: boolean;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.bulletId = this.readByte();
        this.targetId = this.readInt32();
        this.kill = this.readBoolean();
    }

    public write(): void {
        this.writeInt32(this.time);
        this.writeByte(this.bulletId);
        this.writeInt32(this.targetId);
        this.writeBoolean(this.kill);
    }
}
