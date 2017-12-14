# Contributing
Firstly, thanks for considering contributing to nrelay! All contributions are welcome, whether it is a pull request, a bug report or a suggestion. The following is a set of guidelines which can help developers and other contributors better understand your contribution. Following these guidelines will help with things like: reducing duplicate bugs, getting bugs fixed quicker and getting your pull request accepted with minimal (if any) changes required.

## Contents
 + [Reporting bugs](#reporting-bugs)
 + [Submitting a pull request](#submitting-a-pull-request)


### Reporting bugs
When submitting a bug report, following these guidelines can help developers understand the issue better which will make it more likely for a fix to be found sooner.

#### Before you submit an issue
Always look through the [existing issues](https://github.com/thomas-crane/nrelay/issues) to make sure you aren't submitting a bug which has already been submitted.
If you find that the bug you are experiencing has already been submitted, you should leave a comment if you find any additional information about the bug which hasn't already been mentioned in the issue report.

If you are able to provide additional information, you should still try to follow the bug report guidelines as closely as possible when writing your comment. However, it is OK to omit details which are already included in the issue report (such as steps to reproduce, or error message).

#### Submitting an issue
There are a few things you should always include with any issue report:
 + __Which version of nrelay are you using?__ This helps developers work out if the issue was introduced recently, or if it has been around for a long time.
 + __Which version of RotMG is nrelay running?__ You can find the RotMG version in the `src/services/updater-assets/version.txt` file. This helps developers work out if the issue is related to a specific version of RotMG.
 + __Which plugins are you using?__ Providing a list of plugins you are using (where to find them is helpful too) can help the developers determine if a specific plugin is causing an issue, or if the problem is within one of the plugins. If you are using unreleased or private plugins, you can instead provide information about which features of nrelay the plugins use (such as the `ResourceManager` or which packets the plugins use).

If you are able to provide steps to reproduce the issue, these can greatly reduce the time required to fix the issue.

An example of an issue following the above guidelines is
````markdown
### Version info
 + nrelay version: `4.3.0`
 + RotMG version: `1513010023`

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
````

## Submitting a pull request
`TODO`