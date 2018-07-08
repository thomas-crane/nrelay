import { Packet, PacketType } from '../../packet';
import { SlotObjectData } from '../../data/slot-object-data';

export class InvDropPacket extends Packet {

    type = PacketType.INVDROP;

    //#region packet-specific members
    slotObject: SlotObjectData;
    //#endregion

    read(): void {
        this.slotObject = new SlotObjectData();
        this.slotObject.read(this);
    }

    write(): void {
        this.slotObject.write(this);
    }
}
