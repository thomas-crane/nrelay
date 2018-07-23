export class PacketBuffer {

  bufferIndex: number;
  data: Buffer;

  constructor(size: number = 1024) {
    this.bufferIndex = 0;
    this.data = Buffer.alloc(size);
  }

  readInt32(): number {
    const result = this.data.readInt32BE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  writeInt32(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt32BE(value, this.bufferIndex);
  }

  readUInt32(): number {
    const result = this.data.readUInt32BE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  writeUInt32(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt32BE(value, this.bufferIndex);
  }

  readShort(): number {
    const result = this.data.readInt16BE(this.bufferIndex);
    this.bufferIndex += 2;
    return result;
  }
  writeShort(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt16BE(value, this.bufferIndex);
  }

  readUnsignedShort(): number {
    const result = this.data.readUInt16BE(this.bufferIndex);
    this.bufferIndex += 2;
    return result;
  }
  writeUnsignedShort(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt16BE(value, this.bufferIndex);
  }

  readByte(): number {
    const result = this.data.readInt8(this.bufferIndex);
    this.bufferIndex++;
    return result;
  }
  writeByte(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt8(value, this.bufferIndex);
  }

  readUnsignedByte(): number {
    const result = this.data.readUInt8(this.bufferIndex);
    this.bufferIndex++;
    return result;
  }
  writeUnsignedByte(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt8(value, this.bufferIndex);
  }

  readBoolean(): boolean {
    const result = this.readByte();
    return result !== 0;
  }
  writeBoolean(value: boolean): void {
    const byteValue = value ? 1 : 0;
    this.writeByte(byteValue);
  }

  readFloat(): number {
    const result = this.data.readFloatBE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  writeFloat(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeFloatBE(value, this.bufferIndex);
  }

  readByteArray(): number[] {
    const arraylen = this.readShort();
    const result = new Array<number>(arraylen);
    for (let i = 0; i < arraylen; i++ , this.bufferIndex++) {
      result[i] = this.data[this.bufferIndex];
    }
    return result;
  }
  writeByteArray(value: number[]): void {
    if (!value) {
      this.writeShort(0);
      return;
    }
    this.writeShort(value.length);
    for (let i = 0; i < value.length; i++ , this.bufferIndex++) {
      this.data[this.bufferIndex] = value[i];
    }
  }

  readString(): string {
    const strlen = this.readShort();
    this.bufferIndex += strlen;
    return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
  }
  writeString(value: string): void {
    if (!value) {
      this.writeShort(0);
      return;
    }
    this.writeShort(value.length);
    this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
  }

  readStringUTF32(): string {
    const strlen = this.readInt32();
    this.bufferIndex += strlen;
    return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
  }
  writeStringUTF32(value: string): void {
    if (!value) {
      this.writeInt32(0);
      return;
    }
    this.writeInt32(value.length);
    this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
  }

  resizeBuffer(newSize: number): void {
    if (newSize < this.data.length) {
      this.data = this.data.slice(0, newSize);
    } else if (newSize > this.data.length) {
      this.data = Buffer.concat([this.data, Buffer.alloc(newSize - this.data.length)], newSize);
    }
  }

  reset(): void {
    this.bufferIndex = 0;
    this.data = Buffer.alloc(1024);
  }
}
