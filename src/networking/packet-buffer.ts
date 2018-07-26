/**
 * @module networking
 */
/**
 * A wrapper class for providing read/write methods on top of
 * a Buffer.
 */
export class PacketBuffer {

  /**
   * The current index of the buffer.
   */
  bufferIndex: number;
  /**
   * The wrapped buffer.
   */
  data: Buffer;

  /**
   * Creates a new `PacketBuffer` and initalizes the
   * wrapped buffer to the given `size`.
   * @param size The size of the buffer.
   */
  constructor(size: number = 1024) {
    this.bufferIndex = 0;
    this.data = Buffer.alloc(size);
  }

  /**
   * Reads a 4 byte integer from the buffer.
   */
  readInt32(): number {
    const result = this.data.readInt32BE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  /**
   * Writes a 4 byte integer to the buffer.
   * @param value The value to write.
   */
  writeInt32(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt32BE(value, this.bufferIndex);
  }

  /**
   * Reads a 4 byte unsigned integer from the buffer.
   */
  readUInt32(): number {
    const result = this.data.readUInt32BE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  /**
   * Writes a 4 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUInt32(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt32BE(value, this.bufferIndex);
  }

  /**
   * Reads a 2 byte integer from the buffer.
   */
  readShort(): number {
    const result = this.data.readInt16BE(this.bufferIndex);
    this.bufferIndex += 2;
    return result;
  }
  /**
   * Writes a 2 byte integer to the buffer.
   * @param value The value to write.
   */
  writeShort(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt16BE(value, this.bufferIndex);
  }

  /**
   * Reads a 2 byte unsigned integer from the buffer.
   */
  readUnsignedShort(): number {
    const result = this.data.readUInt16BE(this.bufferIndex);
    this.bufferIndex += 2;
    return result;
  }
  /**
   * Writes a 2 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUnsignedShort(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt16BE(value, this.bufferIndex);
  }

  /**
   * Reads a 1 byte integer from the buffer.
   */
  readByte(): number {
    const result = this.data.readInt8(this.bufferIndex);
    this.bufferIndex++;
    return result;
  }
  /**
   * Writes a 1 byte integer to the buffer.
   * @param value The value to write.
   */
  writeByte(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeInt8(value, this.bufferIndex);
  }

  /**
   * Reads a 1 byte unsigned integer from the buffer.
   */
  readUnsignedByte(): number {
    const result = this.data.readUInt8(this.bufferIndex);
    this.bufferIndex++;
    return result;
  }
  /**
   * Writes a 1 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUnsignedByte(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeUInt8(value, this.bufferIndex);
  }

  /**
   * Reads a single byte from the buffer, returns `true` if the byte is `1` and `false` otherwise.
   */
  readBoolean(): boolean {
    const result = this.readByte();
    return result !== 0;
  }
  /**
   * Writes a single byte to the buffer. Writes `1` if the value is `true` and `0` otherwise.
   * @param value The value to write.
   */
  writeBoolean(value: boolean): void {
    const byteValue = value ? 1 : 0;
    this.writeByte(byteValue);
  }

  /**
   * Reads a 4 byte floating point number from the buffer.
   */
  readFloat(): number {
    const result = this.data.readFloatBE(this.bufferIndex);
    this.bufferIndex += 4;
    return result;
  }
  /**
   * Writes a 4 byte floating point value to the buffer.
   * @param value The value to write.
   */
  writeFloat(value: number): void {
    if (isNaN(value)) {
      value = 0;
    }
    this.bufferIndex = this.data.writeFloatBE(value, this.bufferIndex);
  }

  /**
   * Reads 2 bytes to get the length, then reads `length` bytes from the buffer.
   */
  readByteArray(): number[] {
    const arraylen = this.readShort();
    const result = new Array<number>(arraylen);
    for (let i = 0; i < arraylen; i++ , this.bufferIndex++) {
      result[i] = this.data[this.bufferIndex];
    }
    return result;
  }
  /**
   * Writes the length of the array as a 2 byte integer, then writes `length` bytes to the buffer.
   * @param value The value to write.
   */
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

  /**
   * Reads 2 bytes to get the length, reads `length` bytes from the buffer, then converts
   * the result to a utf8 string.
   */
  readString(): string {
    const strlen = this.readShort();
    this.bufferIndex += strlen;
    return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
  }
  /**
   * Writes the length of the string as a 2 byte integer, then writes the string to the buffer.
   * @param value The value to write.
   */
  writeString(value: string): void {
    if (!value) {
      this.writeShort(0);
      return;
    }
    this.writeShort(value.length);
    this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
  }

  /**
   * The same as `readString()`, but reads 4 bytes for the length.
   */
  readStringUTF32(): string {
    const strlen = this.readInt32();
    this.bufferIndex += strlen;
    return this.data.slice(this.bufferIndex - strlen, this.bufferIndex).toString('utf8');
  }
  /**
   * The same as `writeString()`, but writes 4 bytes for the length.
   * @param value The value to write.
   */
  writeStringUTF32(value: string): void {
    if (!value) {
      this.writeInt32(0);
      return;
    }
    this.writeInt32(value.length);
    this.bufferIndex += this.data.write(value, this.bufferIndex, value.length, 'utf8');
  }

  /**
   * Changes the size of the buffer without affecting the contents.
   * @param newSize The new size of the buffer.
   */
  resizeBuffer(newSize: number): void {
    if (newSize < this.data.length) {
      this.data = this.data.slice(0, newSize);
    } else if (newSize > this.data.length) {
      this.data = Buffer.concat([this.data, Buffer.alloc(newSize - this.data.length)], newSize);
    }
  }

  /**
   * Resets the `bufferIndex` to `0` and allocates a fresh buffer of length 1024 to the underlying buffer.
   */
  reset(): void {
    this.bufferIndex = 0;
    this.data = Buffer.alloc(1024);
  }
}
