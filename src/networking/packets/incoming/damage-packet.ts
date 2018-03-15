import { Packet, PacketType } from '../../packet';

export class DamagePacket extends Packet {

    public type = PacketType.DAMAGE;

    //#region packet-specific members
    targetId: number;
    effects: number[];
    damageAmount: number;
    kill: boolean;
    armorPierce: boolean;
    bulletId: number;
    objectId: number;
    //#endregion

    public read(): void {
        this.targetId = this.readInt32();
        const effectsLen = this.readUnsignedByte();
        this.effects = new Array<number>(effectsLen);
        for (let i = 0; i < effectsLen; i++) {
            this.effects[i] = this.readUnsignedByte();
        }
        this.damageAmount = this.readUnsignedShort();
        this.kill = this.readBoolean();
        this.armorPierce = this.readBoolean();
        this.bulletId = this.readUnsignedByte();
        this.objectId = this.readInt32();
    }

    public write(): void {
        this.writeInt32(this.targetId);
        this.writeUnsigedByte(this.effects.length);
        for (let i = 0; i < this.effects.length; i++) {
            this.writeUnsigedByte(this.effects[i]);
        }
        this.writeUnsignedShort(this.damageAmount);
        this.writeBoolean(this.kill);
        this.writeBoolean(this.armorPierce);
        this.writeUnsigedByte(this.bulletId);
        this.writeInt32(this.objectId);
    }
}
