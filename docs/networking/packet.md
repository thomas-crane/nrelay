# Packet
This class represents a packet sent or received over the network between nrelay and the game server.

### [Exported interfaces](#exported-interfaces)
 + [`IPacket`](#ipacket)
### [Exported classes](#exported-classes)
 + [`Packet`](#packet-implements-ipacket)

### Exported interfaces
### IPacket
### Public members
#### `type: PacketType`
The type of the packet. `PacketType` is an enum containing all packet ids.

#### `data: Buffer`
A buffer containing the raw data of the packet.

### Public methods
#### `read(): void`
Reads the raw data from the `data` buffer into the packet members.

#### `write(): void`
Writes the values in the packet members to the `data` buffer.

### Exported classes

### `Packet implements IPacket`
### Public members
#### `bufferIndex: number`
Keeps track of the buffer index when calling the `read()` or `write()` methods.

### Public methods
#### `abstract read(): void`
Implemented in subclasses of `Packet` to read the raw data from the `data` buffer into the packet members.

#### `abstract write(): void`
Implemented in subclasses of `Packet` to write the values in the packet members to the `data` buffer.

#### `readInt32(): number`
Reads a 32 bit integer from the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `writeInt32(value: number): void`
Writes a 32 bit integer to the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `readUInt32(): number`
Reads an unsigned 32 bit integer from the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `writeUInt32(value: number): void`
Writes an unsigned 32 bit integer to the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `readShort(): number`
Reads a 16 bit integer from the `data` buffer and advances the `bufferIndex` by 2 bytes.

#### `writeShort(value: number): void`
Writes a 16 bit integer to the `data` buffer and advances the `bufferIndex` by 2 bytes.

#### `readUnsignedShort(): number`
Reads an unsigned 16 bit integer from the `data` buffer and advances the `bufferIndex` by 2 bytes.

#### `writeUnsignedShort(value: number): void`
Writes an unsigned 16 bit integer to the `data` buffer and advances the `bufferIndex` by 2 bytes.

#### `readByte(): number`
Reads an 8 bit integer from the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `writeByte(value: number): void`
Writes an 8 bit integer to the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `readUnsignedByte(): number`
Reads an unsigned 8 bit integer from the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `writeUnsignedByte(value: number): void`
Writes an unsigned 8 bit integer to the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `readBoolean(): boolean`
Reads a boolean from the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `writeByte(value: number): void`
Writes a boolean to the `data` buffer and advances the `bufferIndex` by 1 byte.

#### `readFloat(): number`
Reads a 32 bit floating-point value from the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `writeFloat(value: number): void`
Writes a 32 bit floating-point value to the `data` buffer and advances the `bufferIndex` by 4 bytes.

#### `readByteArray(): Int8Array`
Reads an array of bytes from the `data` buffer and advances the `bufferIndex` by the number of bytes plus 2 bytes for the array length.

#### `writeByteArray(value: Int8Array): void`
Writes an array of bytes to the `data` buffer and advances the `bufferIndex` by the number of bytes plus 2 bytes for the array length.

#### `readString(): string`
Reads a string from the `data` buffer and advances the `bufferIndex` by the number of characters in the string plus 2 bytes for the string length.

#### `writeString(value: string): void`
Writes a string to the `data` buffer and advances the `bufferIndex` by the number of characters in the string plus 2 bytes for the string length.

#### `readStringUTF32(): string`
Reads a UTF32 string from the `data` buffer and advances the `bufferIndex` by the number of characters in the string plus 4 bytes for the string length.

#### `writeStringUTF32(value: string): void`
Writes a UTF32 string to the `data` buffer and advances the `bufferIndex` by the number of characters in the string plus 4 bytes for the string length.

#### `resizeBuffer(newSize: number): void`
> Not yet implemented.

#### `reset(): void`
Resets the `bufferIndex` and `data` buffer.
