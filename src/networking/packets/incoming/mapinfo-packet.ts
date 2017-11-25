import { Packet, PacketType } from '../../packet';

export class MapInfoPacket extends Packet {

    public type = PacketType.MAPINFO;

    //#region packet-specific members
    width: number;
    height: number;
    name: string;
    displayName: string;
    difficulty: number;
    fp: number;
    background: number;
    allowPlayerTeleport: boolean;
    showDisplays: boolean;
    clientXML: string[];
    extraXML: string[];
    //#endregion

    public read(): void {
        this.width = this.readInt32();
        this.height = this.readInt32();
        this.name = this.readString();
        this.displayName = this.readString();
        this.fp = this.readUInt32();
        this.background = this.readInt32();
        this.difficulty = this.readInt32();
        this.allowPlayerTeleport = this.readBoolean();
        this.showDisplays = this.readBoolean();
        this.clientXML = new Array<string>(this.readShort());
        for (let i = 0; i < this.clientXML.length; i++) {
            this.clientXML[i] = this.readStringUTF32();
        }
        this.extraXML = new Array<string>(this.readShort());
        for (let i = 0; i < this.extraXML.length; i++) {
            this.extraXML[i] = this.readStringUTF32();
        }
    }

    public write(): void {
        this.writeInt32(this.width);
        this.writeInt32(this.height);
        this.writeString(this.name);
        this.writeString(this.displayName);
        this.writeUInt32(this.fp);
        this.writeInt32(this.background);
        this.writeInt32(this.difficulty);
        this.writeBoolean(this.allowPlayerTeleport);
        this.writeBoolean(this.showDisplays);
        this.writeShort(this.clientXML.length);
        for (let i = 0; i < this.clientXML.length; i++) {
            this.writeStringUTF32(this.clientXML[i]);
        }
        this.writeShort(this.extraXML.length);
        for (let i = 0; i < this.extraXML.length; i++) {
            this.writeStringUTF32(this.extraXML[i]);
        }
    }
}
