import { Packet, PacketType } from '../../packet';
import { WorldPosData } from '../../data/world-pos-data';
import { SlotObjectData } from '../../data/slot-object-data';

export class InvSwapPacket extends Packet {

    public type = PacketType.INVSWAP;

    //#region packet-specific members
    time: number;
    position: WorldPosData;
    slotObject1: SlotObjectData;
    slotObject2: SlotObjectData;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.position = new WorldPosData();
        this.position.read(this);
        this.slotObject1 = new SlotObjectData();
        this.slotObject1.read(this);
        this.slotObject2 = new SlotObjectData();
        this.slotObject2.read(this);
    }

    public write(): void {
        this.writeInt32(this.time);
        this.slotObject1.write(this);
        this.slotObject2.write(this);
    }
}
