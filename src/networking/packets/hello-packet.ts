import { Packet, PacketType } from '../packet';
import { encryptGUID } from '../../crypto/guid-encrypt';

export class HelloPacket extends Packet {
    public id: 94;
    public type: PacketType.Hello;

    // packet-specific members
    buildVersion: string;
    gameId: number;
    guid: string;
    random1: number;
    password: string;
    random2: number;
    secret: string;
    keyTime: number;
    key: Int8Array;
    mapJSON: string;
    entryTag: string;
    gameNet: string;
    gameNetUserId: string;
    playPlatform: string;
    platformToken: string;
    userToken: string;
    // -----------------------

    data: Buffer;

    public read(): void {

    }

    public write(): void {
        // const array: any[] = [];
        // array.push(this.buildVersion);
        // array.push(this.gameId);
        // array.push(this.guid);
        // array.push(this.random1);
        // // ...
        // this.data = Buffer.from(array);

        this.reset();

        this.writeString(this.buildVersion);
        this.writeInt32(this.gameId);
        this.writeString(encryptGUID(this.guid));
        this.writeInt32(this.random1);
        this.writeString(encryptGUID(this.password));
        this.writeInt32(this.random2);
        this.writeString(encryptGUID(this.secret));
        this.writeInt32(this.keyTime);
        this.writeShort(this.key.length);
        this.writeByteArray(this.key);
        this.writeStringUTF32(this.mapJSON);
        this.writeString(this.entryTag);
        this.writeString(this.gameNet);
        this.writeString(this.gameNetUserId);
        this.writeString(this.playPlatform);
        this.writeString(this.platformToken);

        // resize to as small as needed.
        this.data = this.data.slice(0, this.bufferIndex);
    }
}
