import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class TextPacket implements IncomingPacket {

  type = PacketType.TEXT;

  //#region packet-specific members
  name: string;
  objectId: number;
  numStars: number;
  bubbleTime: number;
  recipient: string;
  text: string;
  cleanText: string;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.name = buffer.readString();
    this.objectId = buffer.readInt32();
    this.numStars = buffer.readInt32();
    this.bubbleTime = buffer.readUnsignedByte();
    this.recipient = buffer.readString();
    this.text = buffer.readString();
    this.cleanText = buffer.readString();
  }
}
