import { Packet, PacketType } from '../../packet';
import { encryptGUID } from '../../../crypto/guid-encrypt';

export class HelloPacket extends Packet {

    public type = PacketType.HELLO;

    //#region packet-specific members
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
    //#endregion

    data: Buffer;

    public read(): void {
        this.buildVersion = this.readString();
        this.gameId = this.readInt32();
        this.guid = this.readString();
        this.random1 = this.readInt32();
        this.password = this.readString();
        this.random2 = this.readInt32();
        this.secret = this.readString();
        this.keyTime = this.readInt32();
        this.key = this.readByteArray();
        this.mapJSON = this.readStringUTF32();
        this.entryTag = this.readString();
        this.gameNet = this.readString();
        this.gameNetUserId = this.readString();
        this.playPlatform = this.readString();
        this.platformToken = this.readString();
        this.userToken = this.readString();
    }

    public write(): void {
        this.writeString(this.buildVersion);
        this.writeInt32(this.gameId);
        this.writeString(encryptGUID(this.guid));
        this.writeInt32(this.random1);
        this.writeString(encryptGUID(this.password));
        this.writeInt32(this.random2);
        this.writeString(encryptGUID(this.secret));
        this.writeInt32(this.keyTime);
        this.writeByteArray(this.key);
        this.writeStringUTF32(this.mapJSON);
        this.writeString(this.entryTag);
        this.writeString(this.gameNet);
        this.writeString(this.gameNetUserId);
        this.writeString(this.playPlatform);
        this.writeString(this.platformToken);
        this.writeString(this.userToken);
    }
}
