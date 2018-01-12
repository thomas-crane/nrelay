### Version info
 + nrelay version: `4.3.0`
 + RotMG version: `X20.1.0`

### Plugins
 + [Cool Plugin](https://www.link-to-plugin.com)
 + Realm Monitor (_unreleased_)
    + Uses features
        + ResourceManager.tiles
        + ResourceManager.enemies
    + Uses packets
        + `UpdatePacket`
        + `NewTickPacket`
        + `UsePortalPacket`

### Steps to reproduce
1. Start nrelay

### Result
```
The bot crashes with the error:
[ResourceManager] Loaded 1231 tiles.
[NRelay] Error while checking for update, starting anyway.
[ResourceManager] Loaded 1231 tiles.
(node:7424) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: Example error
(node:7424) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```
