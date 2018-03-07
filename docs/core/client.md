# Client
The `Client` class represents a bot connected to the game server.

### [Public members](#public-members)
 + [`playerData: IPlayerData`](#playerdata-iplayerdata)
 + [`packetio: PacketIO`](#packetio-packetio)
 + [`nextPos: WorldPosData`](#nextpos-worldposdata)
 + [`mapInfo: IMapInfo`](#mapinfo-imapinfo)
 + [`mapTiles: GroundTileData[]`](#maptiles-groundtiledata)
 + [`readonly charInfo: ICharacterInfo`](#readonly-charinfo-icharacterinfo)
 + [`readonly server: IServer`](#readonly-server-iserver)
 + [`alias: string`](#alias-string)
 + [`readonly guid: string`](#readonly-guid-string)
 + [`moveMultiplier: number`](#movemultiplier-number)
 + [`connected: boolean`](#connected-boolean)

### [Public methods](#public-methods)
 + [`static on(event: string | symbol, listener: (...args: any[]) => void)`](#static-onevent-string--symbol-listener-args-any--void)
 + [`setProxy(proxy: IProxy): void`](#setproxyproxy-iproxy-void)
 + [`shoot(angle: number): boolean`](#shootangle-number-boolean)
 + [`blockNext(packetType: PacketType): void`](#blocknextpackettype-packettype-void)
 + [`broadcastPacket(packet: Packet): void`](#broadcastpacketpacket-packet-void)
 + [`getTime(): number`](#gettime-number)
 + [`findPath(to: IPoint): void`](#findpathto-ipoint-void)
 + [`destroy(): void`](#destroy-void)

### Public members
#### `playerData: IPlayerData`
Holds information about the current character.

#### `packetio: PacketIO`
Responsible for sending/recieving packets.

#### `nextPos: WorldPosData`
When this is assigned to, the Client will move towards the position until it reaches it.

#### `mapInfo: IMapInfo`
Holds metadata about the current map.

#### `mapTiles: GroundTileData[]`
Holds an array of all map tiles. To access a tile at an x, y coordinate you should use something similar to the following
```typescript
public getTile(x: number, y: number): GroundTileData {
    return this.mapTiles[y * mapInfo.height + x];
}
```

#### `readonly charInfo: ICharacterInfo`
Holds meta data about the account's character ids.

#### `server: IServer`
The server the client is connected to.

#### `alias: string`
The alias of the client.

#### `readonly guid: string`
The email address of the client.

#### `moveMultiplier: number`
The percentage of the possible max speed the player will move at. This should be a number between 0 and 1 where 0 represents 0% and 1 represents 100%.

#### `connected: boolean`
Indicates whether or not the client's TCP socket is currently connected to a server.

### Public methods
#### `static on(event: string | symbol, listener: (...args: any[]) => void)`
Used to attach event listeners to the `Client` events.

The available events are:
```typescript
// fired when a client connects to the server.
Client.on('connect', (playerData: IPlayerData, client: Client) => {
    // note that playerData will still be the default values
    // because no player data has been received yet.

    // the client parameter is a reference to the
    // client which fired the event.
});
```
```typescript
// fired when a client disconnects from the server.
Client.on('disconnect', (playerData: IPlayerData, client: Client) => {
    // last known playerData and a reference to the client
    // which fired the event. example usage:
    delete this.clients[playerData.name];
});
```
```typescript
// fired when a client connects to the map and is
// ready to send and receive traffic over the Packet IO.
Client.on('ready', (playerData: IPlayerData, client: Client) => {
    // note that playerData will still be the default values
    // because no player data has been received yet.

    // the client parameter is a reference to the
    // client which fired the event.
});
```

#### `setProxy(proxy: IProxy): void`
Used to connect the client to a new proxy. If the `proxy` parameter is `null` then the client will connect without a proxy.

#### `shoot(angle: number): boolean`
Used to fire the currently equiped weapon. `angle` should be in radians.

This will return `true` if a shoot packet was actually sent, and `false` if a shoot packet is not sent. A shoot packet will not be sent if the required time between shots has not elapsed.

#### `blockNext(packetType: PacketType): void`
Blocks the next packet of type `packetType` which is received by the client. This will stop the client from sending the packet to any plugins too.

#### `broadcastPacket(packet: Packet): void`
Broadcasts the `packet` to all connected clients except the client which broadcasted the packet. The clients which receive the broadcasted packet will handle the packet in the same way they would handle a real packet coming from the game server.

#### `getTime(): number`
Returns how long the client has been connected for in milliseconds. This is used for several packets including the UseItem packet.

#### `findPath(to: IPoint): void`
Uses AStar pathfinding to find a path to the `to` location. The path will update when new tiles become available in case a better route is found and will keep running until the client reaches its path or no path is available. `to` should be a location in game coordinates on the map.

#### `destroy(): void`
This should only be used when the client is no longer required. This will remove all listeners and free any memory possible.
This method is called by the `CLI` when `CLI.removeClient` is called, so it is recommended to not call it manually.
