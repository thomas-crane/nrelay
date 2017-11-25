# Changelog

## `1.0.0`
Initial

## `2.0.0`
> Not backwards compatible.
### Changes:
 + Changed `SeverityLevel` to `LogLevel` for brevity. This change is not backwards compatible with plugins written for `1.x.x` if the plugin uses the `SeverityLevel` enum.

## `2.1.0`
### Changes:
 + Added `gulp` to automate builds and add extra functionality such as copying files.

## `3.0.0`
> Not backwards compatible.
### Changes:
 + Changed the `PacketType` enum to use all uppercase packet names instead of pascal case. This is to make the update process easier. This change is not backwards compatible with plugins written for `2.x.x` if the plugin uses any values from the `PacketType` enum.

## `3.1.0`
### Changes:
 + Added new gulp tasks:
    + `gulp watch` rebuilds the source any time a `.ts` file changes.
    + `gulp clean` deletes the updater assets which are not needed.

## `3.1.1`
### Fixes:
 + Updated `Client` packet hooks to use new uppercase `PacketType` values.
