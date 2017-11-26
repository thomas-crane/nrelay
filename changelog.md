# Changelog

## `1.0.0`
Initial

## `2.0.0`
> Not backwards compatible.
### Changes:
 + Changed `SeverityLevel` to `LogLevel` for brevity. This change is not backwards compatible with plugins written for `1.0.0` if the plugin uses the `SeverityLevel` enum.

## `2.1.0`
### Changes:
 + Added `gulp` to automate builds and add extra functionality such as copying files.

## `2.2.0`
## Changes"
 + Added `ReconnectPacket` and `UsePortalPacket`.
 + Modified `Client` to respond to `ReconnectPackets` correctly.
 + Added player data reset on failure packet to reset state.
