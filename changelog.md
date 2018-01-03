# Changelog
This changelog uses [Semantic Versioning 2.0.0](https://semver.org/).

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
