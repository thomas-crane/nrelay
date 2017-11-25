import { Packet, PacketType } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';

export class AoePacket extends Packet {

    public type = PacketType.AOE;

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
        this.damage = this.readUnsignedShort();
        this.effect = this.readUnsignedByte();
        this.duration = this.readFloat();
        this.origType = this.readUnsignedShort();
        this.color = this.readInt32();
    }

    public write(): void {
        this.pos.write(this);
        this.writeFloat(this.radius);
        this.writeUnsignedShort(this.damage);
        this.writeUnsigedByte(this.effect);
        this.writeFloat(this.duration);
        this.writeUnsignedShort(this.origType);
        this.writeInt32(this.color);
    }
}
