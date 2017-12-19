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
Pull requests can be submitted to add or change code, add more documentation, or fix typos and errors in existing documentation. Some of these guidelines only apply to code related pull requests, and some only apply to documentation pull requests, but most apply to both.

When submitting a pull request, there are a few things you can do to increase the chance of your pull request being accepted:
 + __If your pull request addresses any issues, mention them.__ This helps developers verify that the issues you intended to fix have actually been fixed.
 + __Keep the formatting consistent with existing formatting.__ Minor inconsistencies are OK (such as a bracket being on a newline instead of the same line). However, if your pull request changes a large amount of existing formatting, or isn't consistent with existing formatting at all, then it will not be accepted. If the code still _works_ and the formatting issue is the only one, then it is likely that a request for review will be made requesting a format change, rather than the pull request being closed straight away.

There are also a few things which you should __always__ do when making a pull request:
 + __Update the `changelog.md` and `package.json` version numbers. This only applies to code related pull requests__ The `changelog.md` is used to describe what has changed between versions of nrelay. It uses [Semantic Versioning 2.0.0](https://semver.org/), so you should make sure to increment the correct number for your change.
 + __Don't include 'Work in Progress' code.__ Don't make a pull request if the code you are adding is not fully complete or is still a work in progress. Code which has room for improvement or only has basic functionality is fine. Just don't include features which aren't fully implemented or don't properly work.