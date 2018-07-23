import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class MapInfoPacket implements IncomingPacket {

  type = PacketType.MAPINFO;

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

  read(buffer: PacketBuffer): void {
    this.width = buffer.readInt32();
    this.height = buffer.readInt32();
    this.name = buffer.readString();
    this.displayName = buffer.readString();
    this.fp = buffer.readUInt32();
    this.background = buffer.readInt32();
    this.difficulty = buffer.readInt32();
    this.allowPlayerTeleport = buffer.readBoolean();
    this.showDisplays = buffer.readBoolean();
    this.clientXML = new Array<string>(buffer.readShort());
    for (let i = 0; i < this.clientXML.length; i++) {
      this.clientXML[i] = buffer.readStringUTF32();
    }
    this.extraXML = new Array<string>(buffer.readShort());
    for (let i = 0; i < this.extraXML.length; i++) {
      this.extraXML[i] = buffer.readStringUTF32();
    }
  }
}
