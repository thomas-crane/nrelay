import { Packet, PacketType } from '../../packet';
import { WorldPosData } from './../../data/world-pos-data';

export class ShowEffectPacket extends Packet {

    public type = PacketType.SHOWEFFECT;

    //#region packet-specific members
    effectType: number;
    targetObjectId: number;
    pos1: WorldPosData;
    pos2: WorldPosData;
    color: number;
    duration: number;
    //#endregion

    public read(): void {
        this.effectType = this.readUnsignedByte();
        this.targetObjectId = this.readInt32();
        this.pos1 = new WorldPosData();
        this.pos1.read(this);
        this.pos2 = new WorldPosData();
        this.pos2.read(this);
        this.color = this.readInt32();
        this.duration = this.readFloat();
    }

    public write(): void {
        this.writeUnsigedByte(this.effectType);
        this.writeInt32(this.targetObjectId);
        this.pos1.write(this);
        this.pos2.write(this);
        this.writeInt32(this.color);
        this.writeFloat(this.duration);
    }
}
