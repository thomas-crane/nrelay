import { Packet, PacketType } from '../../../packet';
import { SlotObjectData } from '../../../data/slot-object-data';

export class QuestRedeemPacket extends Packet {

    type = PacketType.QUESTREDEEM;

    //#region packet-specific members
    questId: string;
    slots: SlotObjectData[];
    //#endregion

    read(): void {
        this.questId = this.readString();
        const slotsLen = this.readShort();
        this.slots = new Array<SlotObjectData>(slotsLen);
        for (let i = 0; i < slotsLen; i++) {
            this.slots[i] = new SlotObjectData();
            this.slots[i].read(this);
        }
    }

    write(): void {
        this.writeString(this.questId);
        this.writeShort(this.slots.length);
        for (let i = 0; i < this.slots.length; i++) {
            this.slots[i].write(this);
        }
    }
}
