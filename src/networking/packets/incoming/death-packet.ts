import { Packet, PacketType } from '../../packet';

export class DeathPacket extends Packet {

    public type = PacketType.DEATH;

    //#region packet-specific members
    accountId: string;
    charId: number;
    killedBy: string;
    zombieId: number;
    zombieType: number;
    isZombie: boolean;
    //#endregion

    public read(): void {
        this.accountId = this.readString();
        this.charId = this.readInt32();
        this.killedBy = this.readString();
        this.zombieType = this.readInt32();
        this.zombieId = this.readInt32();
        this.isZombie = this.zombieId !== -1;
    }

    public write(): void {
        this.writeString(this.accountId);
        this.writeInt32(this.charId);
        this.writeString(this.killedBy);
        this.writeInt32(this.zombieType);
        this.writeInt32(this.zombieId);
    }
}
