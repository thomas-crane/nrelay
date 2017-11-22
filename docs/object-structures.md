# Object Structures
This document outlines the structure of all types which are available.

## Table of Contents
 + [Client](#client)
 + [IPlayerData](#iplayerdata)
 + [IPacket](#ipacket)
 + [Packet](#packet)
 + [Packet IO](#packetio)

## Client
### Public members
#### `playerData: IPlayerData`
Holds information about the current character.

#### `packetio: PacketIO`
Responsible for sending/recieving packets.

#### `nextPos: WorldPosData`
When this is assigned to, the Client will move towards the position until it reaches it.

#### `mapInfo: { width: number, height: number, name: string };`
Holds metadata about the current map.

#### `mapTiles: GroundTileData[]`
Holds an array of all map tiles. To access a tile at an x, y coordinate you should use something similar to the following
```typescript
public getTile(x: number, y: number): GroundTileData {
    return this.mapTiles[y * mapInfo.height + x];
}
```

#### `charInfo: { charId: number, nextCharId: number, maxNumChars: number };`
Holds meta data about the account's character ids.

### Public methods
This class has no public methods.

## IPlayerData
### Public members
#### `objectId: number;`
The object id of the player.

#### `worldPos: WorldPosData;`
The current position of the player.

#### `name: string;`
The name of the player.

#### `level: number;`
The player's current level.

#### `exp: number;`
The player's current exp.

#### `currentFame: number;`
The player's current fame.

#### `maxHP: number;`
The player's max hp.

#### `maxMP: number;`
The player's max mp.

#### `hp: number;`
The player's current hp.

#### `mp: number;`
The player's current mp.

#### `atk: number;`
The player's current attack.

#### `def: number;`
The player's current defense.

#### `spd: number;`
The player's current speed.

#### `dex: number;`
The player's current dexterity.

#### `wis: number;`
The player's current wisdom.

#### `vit: number;`
The player's current vitality.

#### `hpPots: number;`
The number of hp pots the player has.

#### `mpPots: number;`
The number of mp pots the player has.

#### `hasBackpack: boolean;`
Whether or not the player has a backpack.

#### `inventory: { [id: number]: number };`
An array of item ids which represent the players equipment. Slots 0-3 are the currently equipped items, slots 4-11 are the inventory and slots 11-18 are the backpack.

#### `server: string`
The name of the server the client is connected to.

## IPacket
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

## Packet
### `implements IPacket`

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

## PacketIO

### Public members
This class has no public members.

### Public methods
#### `on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter`
Used to attach an event listener to the packetio.

Events which can be fired are:
 + `'packet'` - Fired when a packet is recieved.

#### `sendPacket(packet: Packet): void`
Used to send a packet. The `packet` argument can be any type which is a subclass of `Packet`. This includes all specific packet types such as `PlayerTextPacket` and `UpdateAckPacket`.