# Changelog
This changelog uses [Semantic Versioning 2.0.0](https://semver.org/).

## `6.20.0`
### Changes:
 + Added `tsai` dev dependency and npm task for indexing nrelay.
 + Added generated index files for each directory. This means that files can now be imported from their root directory instead of directly from the file.
 + Fixed errors in docs

## `6.19.4`
### Changes
 + Added `ClaimDailyRewardMessage` and `ClaimDailyRewardResponse` packets.

## `6.19.3`
### Fixes:
 + Fixed error propagation issue in `CLI.addClient`.
 + Improved acc-config error logging.

## `6.19.2`
### Fixes:
 + Fixed incorrect default values in `ResourceManager`.
 + Improved CLI addClient workflow.
 + Stopped PacketIO spamming the console when a packet error occurs.
 + Stopped `proxiedGet` terminating nrelay if an error was thrown.
 + Fixed Client emitting a disconnect event when it shouldn't.
 + Stopped Client reconnecting even after being destroyed.

## `6.19.1`
### Changes:
 + Added the `--force-update` flag to force nrelay to download the latest assets.
### Fixes:
 + Stopped updater continuing update process when it should have stopped.
 + Improved updater logging.
 + Fixed a bug where disabled plugin packet hooks would still be called.

## `6.19.0`
### Changes:
 + Packets are now sent to plugin packet hooks before they are sent to the client.
 + Added `send: boolean` to `Packet`. If this is false the packet will not be sent to the client.
 + Re-enabled the packet id updater.
### Fixes:
 + Updated packet ids and docs to X24.0.0
 + Fixed client NewTick hook throwing an error if the bot didn't have a weapon equipped.
 + Fixed client CreateSuccess hook occasionally throwing an error.
 + Improved log messages of the player tracker component.

## `6.18.0`
### Changes:
 + An IP can be used in the `serverPref` to connect directly to that IP.
 + Added a `serverList` property to the `CLI` which returns all of the loaded servers in the format `{ [id: string]: IServer }`.
 + Added condition effect handling.
 + Added `connectToServer(server: IServer)` to the `Client` class to connect the bot to a different server.
 + Changed string conventions in several classes.
### Fixes:
 + Greatly reduced the number of disconnects when shooting at enemies.
 + Fixed Client time getting reset when it shouldn't.
 + Added condition effect handling to various client methods.
 + Fix `PlayerHitPacket` sometimes attempting to write out of bounds values for the `bulletId`.

## `6.17.1`
### Fixes:
 + Fixed a bug where enemies would not receive new tick updates sometimes.
 + Fixed a typo in the `Projectile` class.

## `6.17.0`
> The changes in this version are part of features which are not fully complete yet and may still contain bugs.
> If you need a **stable** version of nrelay, do not upgrade to this version.
### Changes:
 + Added projectile handling for player and enemy projectiles.
 + Added move records.
 + Added new properties to the `IObject` interface.
 + Added `toPrecisePoint()` to `WorldPosData` to convert the world pos to an `IPoint` without rounding.
 + Made the pathfinder optional and disabled by default. Unless it is required, leaving the pathfinder disabled will greatly improve memory usage per client.
 + Added an optional `currentData?: IPlayerData` parameter to the `processObjectStatus` method.
### Fixes:
 + Stopped client time getting reset when it shouldn't.
 + Fixed the `ResourceManager` not properly loading projectiles.
 + Updated the `Damage` packet structure to reflect the game code.

## `6.16.2`
### Changes:
 + Improved pathfinder path simplification.

## `6.16.1`
### Fixes:
 + Updated RC4 keys to latest keys.
 + Updated packet ids and docs to X23.0.0
 + Disabled packet id updater due to RotMG clients now being obfuscated.

## `6.16.0`
### Changes:
 + Added an optional parameter `charInfo?: ICharacterInfo` to `CLI.addClient()`. If the parameter is provided, _or_ if the `charInfo` property of the provided `account` is not `null`, then the initial web request to retrieve the character info will be skipped and the provided `charInfo` will be used.
 + Added the `loadServers()` method to the `CLI` to load the server list. See the `CLI` docs for more info.
 + Added types to various promises and improved some error messages.
 + Changed some log messages to debug messages to reduce console clutter.

## `6.15.4`
### Changes:
 + Added `'ready'` emitter for client when it will be able to successfully preform PacketIO actions.

## `6.15.3`
### Fixes:
 + Added error handling for `packet.read()` calls in the `PacketIO`.

## `6.15.2`
### Changes:
 + Changed the visibility of `Client.getTime()` to public.
### Fixes:
 + Added stronger typing to some `CLI` error handlers.

## `6.15.1`
### Changes:
 + Added `connected: boolean` property to `Client` to indicate whether or not the TCP socket is connected.

## `6.15.0`
### Changes:
 + Added `readText` and `writeText` methods to `Storage` for reading/writing plaintext.
 + Added a Local Server to facilitate communication between nrelay and other processes. See the `Using the Local Server` section in the readme for more info.
 + Added the `ILocalServerSettings` model to the `acc-info` to provide configuration for the Local Server.
 + Added the `SocketWrapper` class to add convenience methods to `Socket` instances.

## `6.14.1`
### Changes:
 + Added new properties to `IPlayerData`
    + `nameChosen: boolean` - Whether or not the player has chosen a unique name.
    + `guildName: string` - The name of the player's guild, or null if they are not in one.
    + `guildRank: GuildRank` - The guild rank of the player. See `GuildRank` for more info.
 + Added the `GuildRank` enum to map guild rank number codes to their in game ranks.

## `6.14.0`
### Changes:
 + Made `Client.guid` public.
 + Added `trackAllPlayers()` and `getAllPlayers()` to the Player Tracker component. See the `plugin-components` doc for more info.
 + Fixed a bug in the Player Tracker where two clients with similar emails and no explicit alias can't both be tracked.

## `6.13.2`
### Fixes:
 + Fixed a bug in the `PluginManager` which would cause a new plugin with the same class name as a previously added plugin to override the previously added plugin.
 + Updated `HelloPlugin` comments to reflect current plugin requirements.

## `6.13.1`
### Fixes:
 + Fixed a bug where the client would ignore the Account in use error and reconnect in 5 seconds instead of after the specified time.

## `6.13.0`
### Changes:
 + Added AStar pathfinding. See the `findPath` method in the client docs for more info.
 + Added `toPoint(): IPoint` method to the `WorldPosData` class to convert a world pos to an `IPoint` object.
 + Updated packet ids to X22.1.0

## `6.12.0`
### Changes:
 + Added the `Using Firebase to store data` plugin recipe.
 + Added the `broadcastPacket(packet: Packet): void` method to the `Client` class. This method should be used to send a packet to all connected clients except the client which broadcasted the packet.
### Fixes:
 + Fixed a bug where the `CLI` would report plugin loading failures as resource loading failures.

## `6.11.1`
### Fixes:
 + Made `emitPacket` public.

## `6.11.0`
### Changes:
 + Reworked documentation. The docs are now structured in the same way the source code is.
 + Added the `IMapInfo` type to replace inline type of `Client.mapInfo`.
 + Simplified the `IProxy.type` parameter.
 + Updated to latest packet ids.
 + Changed plugin manager code slightly for clarity.

## `6.10.0`
### Changes:
 + Removed path mappings for all modules for now.
 + Added account in use handler to CLI
 + Added a `packet: Packet` parameter to `PacketIO.emitPacket(...)`. Plugins can use this method to emit server packets to other clients.
 + Added `blockNext(packetType: PacketType): void` method to `Client`. This can be used to stop the next packet of the `packetType` type from getting to the client or any plugins.

## `6.9.0`
### Changes:
 + Updated packet ids and docs to X22.0.0
 + Added event emitter to the PlayerTracker component. Available events are `'enter'` for when a player enters, and `'leave'` for when a player leaves. Both events have a single parameter which is the `IPlayerData` of the player.
### Fixes:
 + Fixed some path mappings not working correctly. These path mappings are still unstable and likely to change in the future. It is recommended **not** to use them until a later time.

## `6.8.5`
### Changes:
 + Added path mapping for all `src/` folders. These should be preferred for imports over absolute paths.

## `6.8.4`
### Changes:
 + Added path mapping for incoming/outgoing packets and networking/data classes.

## `6.8.3`
### Changes:
 + Changed client connection/disconnection messages to include server.
 + `IAccount.charInfo` and `IAccount.proxy` are now optional.

## `6.8.2`
### Fixes:
 + Proxy hostnames are now resolved before attempting to connect.

## `6.8.1`
### Fixes:
 + Added missing `userId` and `password` strings to proxy socket constructors.

## `6.8.0`
### Changes:
 + Added SOCKSv4, SOCKSv4a, and SOCKSv5 proxy support.
 + Added `proxiedGet(path: string, proxy: IProxy, params?: { [id: string]: string })` method to `Http` service to route GET requests through a proxy.
 + Added `switchProxy(proxy: IProxy): void` method to `Client` to connect to a different proxy.
### Fixes:
 + Added a guard to prevent the `PacketIO` writing to a destroyed socket.

## 6.7.2`
### Changes:
 + Added `Http.post` to `Http` service class.

## `6.7.1`
### Changes:
 + Added new fields to `IPlayerData`.
 + Added `ObjectStatusData.processObject(data ObjectData)` method to set class property.
### Fixes:
 + Fixed a bug in the `PlayerTracker` component where the `worldPos` property was not updating.
 + Updated packet ids to X21.0.2.

## `6.7.0`
### Changes:
 + Added `PlayerTracker` plugin component. This can be used as part of other plugins to avoid having to implement the player tracking logic for any plugin which requires it. See the `plugin-components` doc for more info.

## `6.6.0`
### Changes:
 + Added plugin interop through the `PluginManager` class.
 + Added `PluginManager.getInstanceOf<T extends object>(instance: new () => T): T | null` method to get the managed instance of a plugin.
 + Added `PluginManager.afterInit(method: () => void)` method to defer the invocation of a method until after all plugins have been loaded.
 + Added `enabled?: boolean` to the `@NrPlugin` decorator object. This can be set to `false` to stop a plugin from loading. It will default to true if not included.
 + Added `PluginManager` to the `plugin-module` for convenience.

## `6.5.2`
### Fixes:
 + Fixed a bug where some `playerData` properties would get reset in the `NewTickPacket` handler.

## `6.5.1`
### Changes:
 + Added `worldPos` and `objectId` properties to the `Client` class as aliases of the `playerData.worldPos` and `playerData.objectId` properties. The aliases should be used instead of the `playerData` properties when possible.
### Fixes:
 + Fixed a bug where the client wouldn't update its own `playerData` even when new information was available in the `NewTickPacket`.

## `6.5.0`
## Changes:
 + Added new `public static` methods to the `CLI` class.
    + `addClient(account: IAccount): Promise<any>` This can be used to add an account at runtime.
    + `removeClient(alias: string): boolean` This can be used to remove a client at runtime.
    + `getClient(alias: string): Client | null` Returns a reference to the client with that `alias`.
    + `getClients(): Client[]` Returns an array of references to all clients.
 + Changed visibility of some `Client` properties.
    + `alias: string` The alias of the client.
    + `moveMultiplier: number` A number between 0 and 1 which controls the move speed of the client.
 + Added a `Client` parameter to the `'connect' | 'disconnect'` client events. The parameter will contain a reference to the client which fired the event. The new event payload signature is `(playerData: IPlayerData, client: Client)`. The `playerData` property still contains the client's playerData in order to maintain backwards compatibility.
 + Added `destroy(): void` methods to `Client` and `PacketIO`. These should only be used when the client is no longer needed and can be freed from memory.
 + Added `activateOnEquip: { statType: number, value: number }[]` property to `IObject`. This contains the stat bonuses which are applied by items.
 + Changed some `ResourceManager` log messages to only appear in debug mode.

## `6.4.9`
### Fixes:
 + Updated `packet-type` to latest packet ids

## `6.4.8`
### Changes:
 + Deprecated `IPlayerData.server` in favor of a new `server: IServer` property on the `Client` class. `IPlayerData.server` is still populated but not gauranteed to be correct after a server restart.

## `6.4.7`
### Fixes:
 + Updated `packet-type` to latest packet ids
 + Updated `ReconnectPacket` to correct structure (thanks @armst198).

## `6.4.6`
### Fixes:
 + Fixed a bug in the client reconnect handler where an empty host field would default to localhost.

## `6.4.5`
### Changes:
 + Changed `IPlayerData.inventory` type from `{ [id: number]: number }` to `number[]`. Since both types are `ArrayLike` objects backwards compatibility should be maintained.
 + Separated logic in `ObjectStatusData.processStatData` into `processStatData` and `processObjectStatus` to provide additional functionality for plugins.
### Fixes:
 + Fixed a bug where the `IPlayerData.inventory` property was populated incorrectly.

## `6.4.4`
### Fixes:
 + Fixed incorrect implementation of `CancelTradePacket`.

## `6.4.3`
### Fixes:
 + Stopped socket errors being processed twice.

## `6.4.2`
### Fixes:
 + `ECONN` errors thrown by the client socket no longer crash nrelay.

## `6.4.1`
### Changes:
 + Added a new property `alias: string` to the `acc-config` structure. Use this to replace the censored email in log messages.
 + Improved log messages for account auth.
### Fixes:
 + Fixed a bug where receiving a `Reconnect` packet to the nexus would cause an error.
 + Receiving an unimplemented packet no longer causes a disconnect.
 + Reconnecting to a new host no longer causes an `ECONNRESET` error.

## `6.4.0`
### Changes:
 + Added timestamp (`hh:mm:ss`) to the Logger
 + Added string padding to the Logger to improve readability
 + Added a log file which mirrors the output to the console
 + Added a new environment property `log: boolean`. If this is `true`, the log file will be written to. If it is `false` the console logs will not be written to the log file. The default value is `true`.
 + Added a new command line flag `--no-log` to disable file logging. This does not persist, to always disable file logging change the `log` property of `environment.ts` to `false`.
### Fixes:
 + Improved `PacketIO` stability. The error `Couldn't read size/id.` appears to have been fixed as a result of the improvements.

## `6.3.0`
### Changes:
 + Added shoot method to Client. This method can be used to make the player fire the currently equipped weapon.
 + Added the `--no-update` command line argument option. Use this to skip checking for updates.

## `6.2.0`
### Changes:
 + Refactored the resource manager to use promises for loading data.
 + Changed the order of operations in the cli.
    + Resource loading happens in parallel.
    + Plugin loading happens after resource loading to prevent race conditions.
 + Change packet creation slightly to simplify packet io.

## `6.1.2`
### Fixes:
 + Fixed a bug in the plugin manager which would stop plugins from loading on a mac.

## `6.1.1`
### Fixes:
 + Fixed a bug where if there were no plugins loaded the client packet hooks wouldn't be called.
 + Fixed a bug in the client `GOTO` packet hook implementation. (thanks to @xd-x)

## `6.1.0`
### Changes:
 + Added error handling to packet hook calls. If a plugin throws an error while executing a plugin hook, the error will be handled instead of nrelay crashing.
 + Added command line argument handling to the cli. The currently supported arguments are:
    + __`--debug`__ Starts nrelay in debug mode.

## `6.0.1`
### Fixes:
 + Fixed a bug where the client event emitter would be null if there were no subscribers.

## `6.0.0`
> Not backwards compatible.
### Changes:
 + Fixed a bug in the client event emitter where it would emit references to values instead of cloned values. This change is not backwards compatible with plugins written for `5.x.x` if the plugin uses the `Client.on('disconnect|connect', (client: Client) => void)` method.

## `5.0.1`
### Fixes:
 + Fixed a bug where the Client event emitter was not initialised before plugins could use it.
 + Added some logging in debug mode to the plugin manager.

## `5.0.0`
> Not backwards compatible.
### Changes:
 + Changed the `Storage` service methods to accept different args. The signatures are now similar to the `path.join` method signature. This change is not backwards compatible with plugins written for `4.x.x` if the plugin uses the `Storage.get` or `Storage.set` methods.
 + Added the `copy-files` gulp task to the default tasks to allow for json files to be copied.

## `4.6.0`
### Changes:
 + Added `error` event to packetio.
 + `Client` will now just reconnect when there is an error reading the packet size or id. This way nrelay will not crash when the error occurs.
 + Added a static event emitter to `Client`. There currently 2 events:

 __`connect`__ is fired when a client connects.
```typescript
Client.on('connect', (client: Client) => {
    // note that client.playerData will still contain default values
    // because the client has not received any player data yet.
    Log('MyPlugin', 'Client connected');
});
```
 __`disconnect`__ is fired when a client disconnects.
```typescript
Client.on('disconnect', (client: Client) => {
    Log('MyPlugin', client.playerData.objectId + ' disconnected');
});
```

 + Added a default value to the `statType` member of `StatData`.
 + Cleaned up `UpdatePacket slightly.

## `4.5.0`
### Changes:
 + Added missing packets to `packets.ts`. Most packets are now available.

## `4.4.0`
### Changes:
 + Added 27 more general outgoing packets. See the `packet-structures` doc for the full list.

## `4.3.0`
### Changes:
 + Added 20 more general incoming packets. See the `packet-structures` doc for the full list.

## `4.2.0`
### Changes:
 + Added incoming packets for arena and pets.

## `4.1.0`
### Changes:
 + Changed resources to JSON instead of XML.
 + Changed updater to fetch JSON resources.
 + Added object loading to `ResourceManager`.
 + Added new models `Object` and `Tile` which hold information loaded from resources.

## `4.0.2`
### Fixes:
 + Fixed error in the `write` implementation of the `AcceptTradePacket` class.

## `4.0.1`
### Fixes:
 + Properly implemented write method for `EnemyShootPacket` class.

## `4.0.0`
> Not backwards compatible.
### Changes:
 + Fixed typo in `TextPacket` property `recipient` (was `recipent`). This change is not backwards compatible with plugins written for `3.x.x` if the plugin uses the `recipent` property of the `TextPacket` class.

## `3.5.3`
### Fixes:
 + Updated packet ids and docs to X20.0.1

## `3.5.2`
### Fixes:
 + Fixed a bug which prevented the player from moving at 100% of their potential speed.

## `3.5.1`
### Fixes:
 + Updated packet ids and docs to X20.0.0

## `3.5.0`
### Changes:
 + Added `enemy-shoot-packet.ts` and relevant packet handler to client.
 + Added AoePacket handler to client.
 + Changed `package.json` description field.
### Fixes:
 + Fixed a bug in the client reconnect handler where it would reconnect to the wrong server.

## `3.4.1`
### Fixes:
 + Fixed a bug where updating would fail if the `resources` folder didn't exist.

## `3.4.0`
### Changes:
 + Added `ReconnectPacket` and `UsePortalPacket`.
 + Added reconnect packet hook on `Client`.

## `3.3.0`
### Changes:
 + Added `Objects.xml` and `GrounTypes.xml` to updater.
 + Added `resources/` to `.gitignore`. Manually change your version to force an update which will download the latest xml resources.

## `3.2.2`
### Fixes:
 + Fixed a bug where the updater filepaths wouldn't correctly resolve if the console was not in the nrelay directory.

## `3.2.1`
### Fixes:
 + Fixed error when trying to read the current version number.

## `3.2.0`
### Changes:
 + Added update service to check for new versions of the game. If a new version is present, the packet ids will be extracted and the `PacketType` enum will be updated.

## `3.1.1`
### Fixes:
 + Updated `Client` packet hooks to use new uppercase `PacketType` values.

## `3.1.0`
### Changes:
 + Added new gulp tasks:
 + `gulp watch` rebuilds the source any time a `.ts` file changes.
 + `gulp clean` deletes the updater assets which are not needed.

## `3.0.0`
> Not backwards compatible.
### Changes:
 + Changed the `PacketType` enum to use all uppercase packet names instead of pascal case. This is to make the update process easier. This change is not backwards compatible with plugins written for `2.x.x` if the plugin uses any values from the `PacketType` enum.

## `2.1.0`
### Changes:
 + Added `gulp` to automate builds and add extra functionality such as copying files.

## `2.0.0`
> Not backwards compatible.
### Changes:
 + Changed `SeverityLevel` to `LogLevel` for brevity. This change is not backwards compatible with plugins written for `1.x.x` if the plugin uses the `SeverityLevel` enum.

## `1.0.0`
Initial
