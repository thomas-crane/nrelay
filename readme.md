# nrelay

A console based modular client for Realm of the Mad God built with Node.js and TypeScript.

Upgrading to v8? [Check out the migration guide.](docs/migration/7-to-8.md)

## Contents

+ [Docs](#docs)
+ [Install](#install)
  + [Prerequisites](#prerequisites)
+ [Setup](#setup)
  + [Using proxies](#using-proxies)
  + [Using the Local Server](#using-the-local-server)
+ [Run](#run)
+ [Command line arguments](#command-line-arguments)
+ [Build](#build)
+ [Acknowledgements](#acknowledgements)

## Docs

The documentation in this repository consists mostly of guides and tutorials about how to use nrelay and its components, and how to create plugins. All of the docs can be found [in the docs folder.](/docs/readme.md)

There is also extensive inline API documentation, which can be viewed [on the docs website.](https://docs.nrelay.net/)

## Install

### Prerequisites

Make sure you have [Nodejs](https://nodejs.org/en/) installed before running nrelay.

1. Install the nrelay cli.

```bash
npm install -g nrelay-cli
```

2. Create a new nrelay project.

```bash
nrelay new my-new-project
```

## Setup

When you create a new nrelay project, you will need to set up your `accounts.json` file. It has been generated for you, but currently only contains an example account.

The current contents of the file will resemble the following.

```json
[
  {
    "alias": "Main Client",
    "guid": "example@email.com",
    "password": "password10",
    "serverPref": "Australia"
  }
]

```

To use your own account, simply replace the `guid` and `password` values with your own account's email and password.

If you have multiple accounts which you want to run at the same time, you can add them by duplicating the segment in the curly braces `{ ... }`. E.g.

```json
[
  {
    "alias": "Main Client",
    "guid": "first.account@email.com",
    "password": "SecretPassWord11",
    "serverPref": "AsiaSouthEast"
  },
  {
    "alias": "Secondary Client",
    "guid": "second.account@email.com",
    "password": "Password22",
    "serverPref": "USSouth"
  }
]

```

### Using proxies

nrelay supports the use of SOCKSv4, SOCKSv4a, and SOCKSv5 proxies to route client connections through. Proxies can be added in the account config as a property of the account

```json-with-comments
{
    "alias": "Main Client",
    "guid": "first.account@email.com",
    "password": "SecretPassWord11",
    "serverPref": "AsiaSouthEast",
    "proxy": {
        "host": "127.0.0.1",  // The ip of the proxy.
        "port": 8080,         // The port of the proxy. Use a number here, e.g. 8080 not "8080".
        "type": 5,            // The type of the proxy. Use 5 for SOCKSv5 and 4 for SOCKSv4 or SOCKSv4a.
        "userId": "username", // The username for the proxy, if one is required.
        "password": "secret"  // The password for the proxy, if one is required.
    }
}
```

If a proxy is specified, nrelay will route all traffic including the initial web request to get the character lists. Because of this, there may be greater delays when using proxies.
The proxy a client is using can also be changed during runtime by using the `Client.setProxy(proxy: IProxy): void` method.

### Using the Local Server

nrelay has a built in Local Server which can be used to transfer data between nrelay and another process, such as KRelay. If you are interested in using the local server, take a look at the [local server guide.](/docs/the-local-server.md)

## Run

After setting up the `accounts.json` file, nrelay is ready to go. To run nrelay, use the command `nrelay run` in the console. If you have setup your `accounts.json` properly (and used the correct credentials) you should see an output similar to this

```bash
C:\Documents> nrelay
[17:25:23 | NRelay]           Starting...
...
[17:25:26 | Main Client]      Authorized account
[17:25:26 | Main Client]      Starting connection to AsiaSouthEast
[17:25:26 | Main Client]      Connected to server!
[17:25:26 | Main Client]      Connecting to Nexus
[17:25:27 | Main Client]      Connected!
```

The `alias` property in the account config is optional. If one is not specified, the log will use a censored email instead

```bash
[17:25:26 | f***@e***.com]    Authorized account
[17:25:26 | f***@e***.com]    Starting connection to AsiaSouthEast
[17:25:26 | f***@e***.com]    Connected to server!
```

## Command line arguments

There are several command line arguments which can be provided when starting nrelay to change the behaviour.

### `--version` or `-v`

This will print the nrelay version number to the console and exit.

### `--debug`

This will start nrelay in debug mode. Debug mode provides a higher detail of logging. It is not recommended to use debug mode unless you are experiencing errors and need more info.

### `--no-update`

This will stop nrelay from checking for updates when it starts.

### `--no-log`

This will stop nrelay from writing to the log file.

### `--no-plugins`

This will stop nrelay from loading any plugins.

### `--force-update`

This will force nrelay to download the latest client and assets.

### `--update-from="filepath"`

This will update the packet ids using the client at the given filepath.

If `filepath` is a path to a file (e.g. `C:\clients\myclient.swf`), then the directory containing the swf will be used to store the decompiled scripts.
If `filepath` is a path to a directory, (e.g. `C:\clients`), then nrelay will assume a file called `client.swf` exists in the directory, and will use the directory to store the decompiled scripts.

Please note that `filepath` should always be an absolute path to either a client or a directory containing a `client.swf`.

### Examples

To start nrelay without checking for updates or log file writing, use

```bash
nrelay run --no-update --no-log
```

To start nrelay and force an update, use

```bash
nrelay run --force-update
```

To print the version number, use

```bash
nrelay -v
```

## Build

Whenever any changes are made to the plugins, they will need to be recompiled in order for the changes to take effect.

To recompile the plugins simply use

```bash
nrelay build
```

## Acknowledgements

This project uses the following open source software:

+ [JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler)
