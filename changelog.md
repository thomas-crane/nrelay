# Changelog
This changelog uses [Semantic Versioning 2.0.0](https://semver.org/).

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
