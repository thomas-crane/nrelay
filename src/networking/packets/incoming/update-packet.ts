import { Packet, PacketType } from '../../packet';
import { GroundTileData } from './../../data/ground-tile-data';
import { ObjectData } from '../../data/object-data';

export class UpdatePacket extends Packet {

    public type = PacketType.UPDATE;

    //#region packet-specific members
    tiles: GroundTileData[];
    newObjects: ObjectData[];
    drops: number[];
    //#endregion

    data: Buffer;

    public read(): void {
        const tilesLen = this.readShort();
        this.tiles = new Array<GroundTileData>(tilesLen);
        for (let i = 0; i < tilesLen; i++) {
            const gd = new GroundTileData();
            gd.read(this);
            this.tiles[i] = gd;
        }

        const newObjectsLen = this.readShort();
        this.newObjects = new Array<ObjectData>(newObjectsLen);
        for (let i = 0; i < newObjectsLen; i++) {
            const od = new ObjectData();
            od.read(this);
            this.newObjects[i] = od;
        }

        const dropsLen = this.readShort();
        this.drops = new Array<number>(dropsLen);
        for (let i = 0; i < dropsLen; i++) {
            this.drops[i] = this.readInt32();
        }
    }

    public write(): void {
        this.writeShort(this.tiles.length);
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].write(this);
        }

        this.writeShort(this.newObjects.length);
        for (let i = 0; i < this.newObjects.length; i++) {
            this.newObjects[i].write(this);
        }

        this.writeShort(this.drops.length);
        for (let i = 0; i < this.drops.length; i++) {
            this.writeInt32(this.drops[i]);
        }
    }
}
