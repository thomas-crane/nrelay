import { Packet, PacketType } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';
import { WorldPosData } from '../../data/world-pos-data';

export class UseItemPacket extends Packet {

    public type = PacketType.USEITEM;

    //#region packet-specific members
    time: number;
    slotObject: SlotObjectData;
    itemUsePos: WorldPosData;
    useType: number;
    //#endregion

    public read(): void {
        this.time = this.readInt32();
        this.slotObject = new SlotObjectData();
        this.slotObject.read(this);
        this.itemUsePos = new WorldPosData();
        this.itemUsePos.read(this);
        this.useType = this.readByte();
    }

    public write(): void {
        this.writeInt32(this.time);
        this.slotObject.write(this);
        this.itemUsePos.write(this);
        this.writeByte(this.useType);
    }
}
