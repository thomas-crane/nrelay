import { Packet, PacketType } from '../../packet';

export class MapInfoPacket extends Packet {
    public id = 83;
    public type: PacketType.MapInfo;

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

    public read() {
        this.width = this.readInt32();
        this.height = this.readInt32();
        this.name = this.readString();
        this.displayName = this.readString();
        this.difficulty = this.readInt32();
        this.fp = this.readUInt32();
        this.background = this.readInt32();
        this.difficulty = this.readInt32();
        this.allowPlayerTeleport = this.readBoolean();
        this.showDisplays = this.readBoolean();

        // in many cases (such as loading the nexus) attempting to
        // read these will read past the end of the buffer. Since there
        // is no protection (yet) just skip these properties.

        // this.clientXML = new Array<string>(this.readShort());
        // for (let i = 0; i < this.clientXML.length; i++) {
        //     this.clientXML[i] = this.readStringUTF32();
        // }
        // this.extraXML = new Array<string>(this.readShort());
        // for (let i = 0; i < this.extraXML.length; i++) {
        //     this.extraXML[i] = this.readStringUTF32();
        // }
    }

    public write() {

    }
}
