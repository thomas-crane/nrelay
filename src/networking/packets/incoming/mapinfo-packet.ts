import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

/**
 * Received in response to the `HelloPacket`.
 */
export class MapInfoPacket implements IncomingPacket {

  type = PacketType.MAPINFO;
  propagate = true;

  //#region packet-specific members
  /**
   * The width of the map.
   */
  width: number;
  /**
   * The height of the map.
   */
  height: number;
  /**
   * The name of the map.
   */
  name: string;
  /**
   * > Unknown.
   */
  displayName: string;
  /**
   * The difficulty rating of the map.
   */
  difficulty: number;
  /**
   * The seed value for the client's PRNG.
   */
  fp: number;
  /**
   * > Unkown.
   */
  background: number;
  /**
   * Whether or not players can teleport in the map.
   */
  allowPlayerTeleport: boolean;
  /**
   * > Unkown.
   */
  showDisplays: boolean;
  /**
   * > Unkown.
   */
  clientXML: string[];
  /**
   * > Unkown.
   */
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
