import { Log, SeverityLevel } from '../services/logger';

export abstract class Packet implements IPacket {
    abstract id: number;
    abstract type: PacketType;

    bufferIndex: number;
    data: Buffer;
    private indexSum: number;

    // Network order == Big endian (BE).
    // Host order == Little endian (LE).

    constructor(data?: Buffer) {
        this.indexSum = 0;
        this.bufferIndex = 0;
        this.data = data || Buffer.alloc(1024);
    }

    abstract read(): void;
    abstract write(): void;

    readInt32(): number {
        const result = this.data.readInt32BE(this.bufferIndex);
        this.bufferIndex += 4;
        return result;
    }
    writeInt32(value: number) {
        this.bufferIndex = this.data.writeInt32BE(value, this.bufferIndex);
    }

    readShort(): number {
        const result = this.data.readInt16BE(this.bufferIndex);
        this.bufferIndex += 2;
        return result;
    }
    writeShort(value: number) {
        this.bufferIndex = this.data.writeInt16BE(value, this.bufferIndex);
    }

    readByte(): number {
        const result = this.data.readInt8(this.bufferIndex);
        this.bufferIndex++;
        return result;
    }
    writeByte(value: number) {
        this.bufferIndex = this.data.writeInt8(value, this.bufferIndex);
    }

    writeByteArray(value: Int8Array) {
        for (let i = 0; i < value.length; i++, this.bufferIndex++) {
            this.data[this.bufferIndex] = value[i];
        }
    }

    readString(): string {
        const strlen = this.readShort();
        this.bufferIndex += strlen;
        return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
    }
    writeString(value: string) {
        this.writeShort(value.length);
        this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
    }

    readStringUTF32(): string {
        const strlen = this.readInt32();
        this.bufferIndex += strlen;
        return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
    }
    writeStringUTF32(value: string) {
        this.writeInt32(value.length);
        this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
    }

    resizeBuffer(newSize: number) {
        const retain = this.data.slice(0, 4);
        this.data = Buffer.alloc(newSize);
        // retain first 4 bytes.
        retain.copy(this.data, 0, 0);
    }

    reset(): void {
        this.bufferIndex = 0;
        this.data = Buffer.alloc(1024);
    }

}

export interface IPacket {
    id: number;
    type: PacketType;

    // possibly unneeded.
    data: Buffer;

    read(): void;
    write(): void;
}

export enum PacketType {
    Hello,
}
