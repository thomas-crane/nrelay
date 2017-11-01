import { Packet, PacketType } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class AoePacket extends Packet {

    public type = PacketType.Aoe;

    //#region packet-specific members
    pos: WorldPosData;
    radius: number;
    damage: number;
    effect: number;
    duration: number;
    origType: number;
    color: number;
    //#endregion

    public read(): void {
        this.pos = new WorldPosData();
        this.pos.read(this);
        this.radius = this.readFloat();
        this.damage = this.readUShort();
        this.effect = this.readUByte();
        this.duration = this.readFloat();
        this.origType = this.readUShort();
        this.color = this.readInt32();
    }

    public write(): void {
        this.pos.write(this);
        this.writeFloat(this.radius);
        this.writeUShort(this.damage);
        this.writeUByte(this.effect);
        this.writeFloat(this.duration);
        this.writeUShort(this.origType);
        this.writeInt32(this.color);
    }
}
