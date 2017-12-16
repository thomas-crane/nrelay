import { Packet, PacketType } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';

export class InvDropPacket extends Packet {

    public type = PacketType.INVDROP;

    //#region packet-specific members
    slotObject: SlotObjectData;
    //#endregion

    public read(): void {
        this.slotObject = new SlotObjectData();
        this.slotObject.read(this);
    }

    public write(): void {
        this.slotObject.write(this);
    }
}
