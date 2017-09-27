import { Log, SeverityLevel } from '../services/logger';

export abstract class Packet implements IPacket {
    abstract id: number;
    abstract type: PacketType;

    bufferIndex: number;
    data: Buffer;
    private indexSum: number;

    // Network order == Big endian (BE).
    // Host order == Little endian (LE).

    constructor() {
        this.indexSum = 0;
        this.bufferIndex = 0;
        this.data = Buffer.alloc(1024);
    }

    abstract read(): void;
    abstract write(): void;

    writeInt32(value: number) {
        this.bufferIndex = this.data.writeInt32LE(value, this.bufferIndex);
    }

    writeShort(value: number) {
        this.bufferIndex = this.data.writeInt16LE(value, this.bufferIndex);
    }

    writeByteArray(value: Int8Array) {
        for (let i = 0; i < value.length; i++, this.bufferIndex++) {
            this.data[this.bufferIndex] = value[i];
        }
    }

    writeString(value: string) {
        this.writeShort(value.length);
        this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
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
