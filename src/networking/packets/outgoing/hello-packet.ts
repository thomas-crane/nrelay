import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';
import { RSA } from '../../../crypto';

export class HelloPacket implements OutgoingPacket {

  type = PacketType.HELLO;

  //#region packet-specific members
  buildVersion: string;
  gameId: number;
  guid: string;
  password: string;
  secret: string;
  keyTime: number;
  key: number[];
  mapJSON: string;
  entryTag: string;
  gameNet: string;
  gameNetUserId: string;
  playPlatform: string;
  platformToken: string;
  userToken: string;
  //#endregion

  write(buffer: PacketBuffer): void {
    buffer.writeString(this.buildVersion);
    buffer.writeInt32(this.gameId);
    buffer.writeString(RSA.encrypt(this.guid));
    buffer.writeInt32(Math.floor(Math.random() * 1000000000));
    buffer.writeString(RSA.encrypt(this.password));
    buffer.writeInt32(Math.floor(Math.random() * 1000000000));
    buffer.writeString(RSA.encrypt(this.secret));
    buffer.writeInt32(this.keyTime);
    buffer.writeByteArray(this.key);
    buffer.writeStringUTF32(this.mapJSON);
    buffer.writeString(this.entryTag);
    buffer.writeString(this.gameNet);
    buffer.writeString(this.gameNetUserId);
    buffer.writeString(this.playPlatform);
    buffer.writeString(this.platformToken);
    buffer.writeString(this.userToken);
  }
}
