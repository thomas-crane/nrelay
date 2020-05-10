# Creating a plugin

To demonstrate how to create plugins and interact with packets/player data this guide will cover how to recreate the Hello Plugin which is included by default with nrelay. The Hello Plugin is a simple plugin which replies to anyone who sends the message 'hello' to the bot.

## Getting started

To get started, let's create a new nrelay project.

```bash
$ nrelay create plugin-tutorial
$ cd plugin-tutorial/
```

Our new project already contains the Hello Plugin, so before we get started let's clear the contents of the file so we've got a blank slate.

```bash
echo "" > src/hello-plugin.ts
```

If you are using windows, or aren't comfortable with the command line, simply deleting the file and creating a fresh one with the same name also works.

Before we continue, let's set up our `accounts.json` file with a single account, and run our empty project to make sure we can continue. Since we've made changes to the plugins, we will need to run `nrelay build` before running our project.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run
[17:51:29 | Runtime]          Checking for updates...
[17:51:29 | Updater]          Checking for new versions...
[17:51:30 | ResourceManager]  Loaded 1638 tiles.
[17:51:30 | ResourceManager]  Loaded 14206 objects.
[17:51:30 | Runtime]          Mapped 99 packet ids.
[17:51:30 | Runtime]          Using build version "X33.1.0"
[17:51:30 | Runtime]          Using client token "XTeP7hERdchV5jrBZEYNebAqDPU6tKU6"
[17:51:30 | LibraryManager]   Loading plugins...
[17:51:30 | Runtime]          Loading Main Client...
[17:51:30 | AccountService]   Loading server list...
[17:51:30 | AccountService]   Cached server list loaded!
[17:51:30 | AccountService]   Loading character info...
[17:51:30 | AccountService]   Cached character info loaded!
[17:51:30 | Runtime]          Loaded Main Client!
[17:51:30 | Main Client]      Starting connection to Australia
[17:51:31 | Main Client]      Connected to Australia!
[17:51:31 | Main Client]      Connecting to Nexus
[17:51:31 | Main Client]      Connected!
```

If all is well, our bot will connect to the Nexus. It doesn't do much right now, so let's fix that. In the next chapter we'll learn how to create a plugin class.
