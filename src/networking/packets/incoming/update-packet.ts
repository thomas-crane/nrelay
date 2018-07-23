import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';
import { GroundTileData } from '../../data/ground-tile-data';
import { ObjectData } from '../../data/object-data';

export class UpdatePacket implements IncomingPacket {

  type = PacketType.UPDATE;

  //#region packet-specific members
  tiles: GroundTileData[];
  newObjects: ObjectData[];
  drops: number[];
  //#endregion

  data: PacketBuffer;

  read(buffer: PacketBuffer): void {
    const tilesLen = buffer.readShort();
    this.tiles = new Array<GroundTileData>(tilesLen);
    for (let i = 0; i < tilesLen; i++) {
      const gd = new GroundTileData();
      gd.read(buffer);
      this.tiles[i] = gd;
    }

    const newObjectsLen = buffer.readShort();
    this.newObjects = new Array<ObjectData>(newObjectsLen);
    for (let i = 0; i < newObjectsLen; i++) {
      const od = new ObjectData();
      od.read(buffer);
      this.newObjects[i] = od;
    }

    const dropsLen = buffer.readShort();
    this.drops = new Array<number>(dropsLen);
    for (let i = 0; i < dropsLen; i++) {
      this.drops[i] = buffer.readInt32();
    }
  }
}
