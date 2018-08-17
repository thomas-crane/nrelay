# nrelay

A console based modular client for Realm of the Mad God built with Node.js and TypeScript.

Upgrading to v7? [Check out the migration guide.](docs/migration/6-to-7.md)

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
  + [Building without gulp](#building-without-gulp)
+ [Acknowledgements](#acknowledgements)

## Docs

The documentation in this repository consists mostly of guides and tutorials about how to use nrelay and its components, and how to create plugins. All of the docs can be found [in the docs folder.](/docs/readme.md)

There is also extensive inline API documentation, which can be viewed [on the docs website.](https://docs.nrelay.net/)

## Install

### Prerequisites

Make sure you have [Nodejs](https://nodejs.org/en/) installed before running nrelay.
You will also need [Java](https://java.com/en/download/) installed in order for the updater to work.

1. Clone the repo to your computer

```bash
git clone https://github.com/thomas-crane/nrelay.git/
```

2. Change directory into the new `nrelay` directory

```bash
cd nrelay
```

3. Install the required dependencies

```bash
npm install
```

4. Install gulp

```bash
npm install -g gulp-cli
```

*If you don't want to install gulp globally, you can still build nrelay without it. See [Building without gulp](#building-without-gulp) for info.*

5. Run the build task to compile the source into JavaScript. This will produce a folder called `dist/`

```bash
gulp
```

#### Note

The following steps are optional, but not performing them will restrict how you can run nrelay. See the [Run](#run) section for more info.

6. Install nrelay as an npm module. This will let you use nrelay from any directory in the console.

```bash
npm install -g
```

7. Link the installed module to this folder to automatically update the module when any code changes happen.

```bash
npm link
```

## Setup

Now that nrelay is installed, you will need to set up your `acc-config.json` file. This can be done in a few steps:

1. Open the nrelay folder in your file explorer
2. Rename the file `acc-config-sample.json` to `acc-config.json`. (Note: Depending on your computer's settings you might not see the `.json` part of the file name)
3. Replace the account info with your own account info.

```json-with-comments
// acc-config-sample.json
{
    "buildVersion": "X25.1.1",              // The current RotMG build version
    "accounts": [
        {
            "alias": "Main Client",         // The name which appears in logs. This is optional.
            "guid": "john@email.com",       // Your RotMG account email.
            "password": "SecretPassWord11", // Your RotMG account password.
            "serverPref": "AsiaSouthEast"   // The preferred server to connect to.
        }
    ]
}
```

If you have multiple accounts which you want to run at the same time, you can add them to the `acc-config` by duplicating the segment in the curly braces `{ ... }`. E.g.

```json-with-comments
// acc-config-sample.json
{
    "buildVersion": "X25.1.1",
    "accounts": [
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
}
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
        "host": "127.0.0.1", // The ip of the proxy
        "port": 8080,        // The port of the proxy. Use a number here, e.g. 8080 not "8080".
        "type": 5            // The type of the proxy. Use 5 for SOCKSv5 and 4 for SOCKSv4 or SOCKSv4a
    }
}
```

If a proxy is specified, nrelay will route all traffic including the initial web request to get the character lists. Because of this, there may be greater delays when using proxies.
The proxy a client is using can also be changed during runtime by using the `Client.setProxy(proxy: IProxy): void` method.

### Using the Local Server

nrelay has a built in Local Server which can be used to transfer data between nrelay and another process, such as KRelay. If you are interested in using the local server, take a look at the [local server guide.](/docs/the-local-server.md)

## Run

After setting up the `acc-config.json` file, nrelay is ready to go. To run nrelay, simply use the command `nrelay` in the console. If you have setup your `acc-config` properly (and used the correct credentials) you should see an output similar to this

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

You will only be able to use the command `nrelay` if you performed step 6 and 7 during the installation. If you didn't do these steps, you will have to run nrelay by following these steps:

1. Open a console in the nrelay directory
2. Use the command `npm start` to build the source and run nrelay, or
3. Use the command `node index` to run nrelay without building the source.

`npm start` will only work if the console is in the nrelay directory, whereas the `nrelay` command can be run anywhere.

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
nrelay --no-update --no-log
```

To start nrelay and force an update, use

```bash
nrelay --force-update
```

To print the version number, use

```bash
nrelay -v
```

## Build

Whenever any changes are made to the TypeScript source files, they will need to be recompiled in order for the changes to take effect.

To recompile the TypeScript simply use

```bash
gulp
```

### Building without gulp

If you don't have gulp globally installed,

```bash
npm run build
```

can be used as an alternative.

This uses the locally installed version of gulp (installed when you run `npm install`), so it will still work even if there is no globally installed version.

## Acknowledgements

This project uses the following open source software:

+ [JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler)
