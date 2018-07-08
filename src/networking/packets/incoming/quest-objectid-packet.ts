import { Packet, PacketType } from '../../packet';

export class QuestObjectIdPacket extends Packet {

    type = PacketType.QUESTOBJID;

    //#region packet-specific members
    objectId: number;
    //#endregion

    read(): void {
        this.objectId = this.readInt32();
    }

    write(): void {
        this.writeInt32(this.objectId);
    }
}
