# Logging Guide
nrelay provides a logging mechanism which can be fully customised to control how nrelay logs messages.
The logging functionality is exposed through the `Logger` service class.

nrelay uses a "logging chain" to allow multiple loggers to be used. The logging chain can be thought of as a linked list of loggers, where a log message is passed to each logger in the chain in the order that they were added to the chain.

For example, the two default loggers which nrelay uses are added to the chain by the CLI, so log messages will be passed to the `DefaultLogger` first, and then to the `FileLogger`.

## Contents
+ [The default loggers](#the-default-loggers)
  + [`DefaultLogger`](#defaultlogger)
  + [`FileLogger`](#filelogger)
+ [Creating custom loggers](#creating-custom-loggers)
  + [Custom `LogLevel`s](#custom-loglevels)
+ [Using custom loggers](#using-custom-loggers)
+ [A complete example: `DiscordLogger`](#a-complete-example-discordlogger)

## The default loggers
nrelay has two built in loggers, which are the default ones that will be used for logging.

### `DefaultLogger`
The `DefaultLogger`, as the name suggests, is the default logger which will be used by nrelay. It provides a way of printing messages to the console with timestamps included. The `DefaultLogger` constructor takes a `minLevel` parameter, which is used to determine whether or not a message will be logged.

By default, the logger will either be passed `LogLevel.Debug`, which is the lowest level, or `LogLevel.Info` depending on the environment settings. If a message is logged, but it's `LogLevel` is below that of `minLevel`, the logger will simply ignore the message.

### `FileLogger`
The `FileLogger` is used to write log messages to a file. It is also used by nrelay to create the `nrelay-log.log` file. The file logger is constructed with a `WriteStream` object, which will be the stream that log messages are written to. The file logger will always write a log message regardless of its `LogLevel`.

## Creating custom loggers
The logger module exports the `LogProvider` interface which defines the required methods for a logger. Custom loggers should be implemented by inheriting from this interface.

For example, an extremely basic logger could be implemented as follows
```typescript
class BasicLogger implements LogProvider {
  log(sender: string, message: string, level: LogLevel): void {
    console.log(`[${sender}] ${message}`);
  }
}
```
This logger simply writes to the console, and completely ignores the `level` parameter.

The `level` parameter can be used to create a more aware logger which might change the style of it's output, or choose to ignore certain messages based on their level.

### Custom `LogLevel`s
The `LogLevel` enum is used to give memorable names to numbers. For example, `LogLevel.Warning` represents the number `3`. This means that the code
```typescript
Logger.log('sender', 'message', LogLevel.Warning);
```
Is equivalent to
```typescript
Logger.log('sender', 'message', 3);
```
Passing a number instead of a `LogLevel` member is *not* considered to be an error by the TypeScript compiler, which means that the possibility exists to define your own log levels which custom loggers can utilise.

For example, we can extend our `BasicLogger` class by exporting a custom "log level" number from the file.
```typescript
export const ReallyImportantMessage = 999;

class BasicLogger implements LogProvider {
  ...
}
```
There is no significance in the number `999`, and while any number will work, the `LogLevel` enum already defines the numbers `0` to `5`.

Now that we have a custom level, our `BasicLogger` can utilise it.
```typescript
class BasicLogger implements LogProvider {
  log(sender: string, message: string, level: LogLevel): void {
    if (level === ReallyImportantMessage) {
      console.log('!!!!!!!!!!!!!');
      console.log(`! [${sender}] ${message}!`);
      console.log('!!!!!!!!!!!!!');
    } else {
      console.log(`[${sender}] ${message}`);
    }
  }
}
```
And the new level can then be used to log an important message
```typescript
Logger.log('MyPlugin', 'Important messages!!', ReallyImportantMessage);
```

## Using custom loggers
Custom loggers need to be added to the logging chain before they will start to receive log messages.

The `Logger` class provides a static method, `addLogger` which takes an instance of a `LogProvider` as a parameter, and will add the instance to the end of the logging chain.

For example, if we want to add the `BasicLogger` to the logging chain, we can simply create a new instance of it and add it.
```typescript
const basicLogger = new BasicLogger();
Logger.addLogger(basicLogger);
```

The logger class provides another static method, `resetLoggers`. This method can be used to clear the logging chain. If we want the `BasicLogger` to be the only logger in the chain, we can simply call `resetLoggers` before adding it.
```typescript
Logger.resetLoggers();
const basicLogger = new BasicLogger();
Logger.addLogger(basicLogger);
```

If there are no loggers in the logging chain, we can still call the `log` method, but the log messages won't go anywhere. This can be utilised to create a "silent mode", where no logging can occur.
```typescript
// simply calling resetLoggers and then not
// adding any loggers will enable "silent mode"
Logger.resetLoggers();
```

## A complete example: `DiscordLogger`
A common use case for nrelay is to send messages to a Discord server. We can implement a custom logger to make an easy to use, and reusable discord utility.

For this example, we will use the Discord.js npm module, which should be installed before we start writing the logger.
```bash
npm install discord.js --save
```
We will create our logger in the `plugins/` folder. Although it is not required to be in this folder, be aware that all of the `import` statements in this example will be relative to the plugins folder.

We can start by importing the Discord.js module and some logger exports.
```typescript
import * as Discord from 'discord.js';
import { LogProvider, LogLevel, Logger } from '../services';
```

We can now declare our class, inherit from `LogProvider`, and implement the required methods as stubs for now.

```typescript
export class DiscordLogger implements LogProvider {

  log(sender: string, message: string, level: LogLevel): void {
    throw new Error('Not implemented yet!');
  }
}

```

Before we write any more code, we should decide how the logger will work. In this example, the design is:
+ A new `DiscordLogger` is constructed with a `token` string as a parameter, which should be the token of the bot we want to use.
+ The `log` method's `sender` property will actually be used for the channel id of the channel we want to send the message to.

With this in mind, we can create the constructor for the `DiscordLogger`. The constructor needs a `token` parameter, and should start the login process straight away.
```typescript
export class DiscordLogger implements LogProvider {

  private client: Discord.Client;

  constructor(token: string) {
    this.client = new Discord.Client();
    this.client.login(token);
  }

  log(sender: string, message: string, level: LogLevel): void {
    throw new Error('Not implemented yet!');
  }
}
```

Because the bot may take some time to login, we don't want to try sending messages before the bot is ready. To solve this problem, we will add a `ready` property that becomes `true` when the bot's `'ready'` event is fired. While we're at it, we'll also add a listener to the `'error'` event for good measure.

```typescript
export class DiscordLogger implements LogProvider {

  private client: Discord.Client;
  private ready = false;

  constructor(token: string) {
    this.client = new Discord.Client();
    this.client.login(token);
    // The ready event only happens once, so 'once' can be used instead of 'on'.
    this.client.once('ready', () => this.ready = true);
    this.client.on('error', (error) => {
      // we can rely on the other loggers in the logging chain to log this error.
      Logger.log('DiscordLogger', `An error occurred: ${error.message}`, LogLevel.Error);
    });
  }

  log(sender: string, message: string, level: LogLevel): void {
    // don't try to log if the bot is not ready.
    if (!this.ready) {
      return;
    }
    throw new Error('Not implemented yet!');
  }
}
```

We are now ready to implement the `log` method itself. Keeping in mind that the `sender` is the channel id, we can simply get the channel from the client, check that it exists, and send the message.
```typescript
log(sender: string, message: string, level: LogLevel): void {
  // don't try to log if the bot is not ready.
  if (!this.ready) {
    return;
  }
  const channel = this.client.channels.get(sender);
  // make sure the channel exists.
  if (!channel) {
    Logger.log('DiscordLogger', `Channel ${sender} does not exist.`, LogLevel.Warning);
    return;
  }
  // cast the channel to a TextChannel so we can call 'send'.
  (channel as Discord.TextChannel).send(message).catch((error) => {
    // make sure to catch any errors.
    Logger.log('DiscordLogger', `Error while sending a message: ${error.message}`, LogLevel.Error);
  });
}
```
The code may look finished at this point, but there is currently a **huge flaw** in the `log` method! The flaw may already be obvious, but don't worry if it isn't. We'll fix it now.

To demonstrate the flaw, imagine what will happen if one of the clients logs a message. The `sender` will be the client's alias, and since the client's alias is *probably* not a discord channel id, this piece of code will be executed:
```typescript
if (!channel) {
  Logger.log('DiscordLogger', `Channel ${sender} does not exist.`, LogLevel.Warning);
  return;
}
```
This code might seem harmless at a glance, but we're calling `log` again, and this time the `sender` is `'DiscordLogger'`. That string is *definitely* not a discord channel id, so this code will be executed again. It should now be obvious that this code will continue to be executed again and again until we get a `RangeError: Maximum call stack size exceeded`.

So what is the solution? We could just remove the log message, but then if we do use a real channel id as the `sender`, but make a small typo, we have no indication of what the problem is.

Recall that the `log` method also accepts arbitrary numbers as the `level` parameter. We can define our own special number for discord messages, and then just ignore any other level. Problem solved!
```typescript
export const DiscordMessageLevel = 999;

export class DiscordLogger implements LogProvider {
  ...
}
```
```typescript
log(sender: string, message: string, level: LogLevel): void {
  // don't try to log unless it's a discord message.
  if (level !== DiscordMessageLevel) {
    return;
  }
  ...
}
```

Now that this problem is solved, we are ready to use the `DiscordLogger` in one of our plugins.

In a plugin where you want to use the discord logger, first import it.
```typescript
// this assumes that the logger is in the file 'discord-logger.ts'
import { DiscordLogger, DiscordMessageLevel } from './discord-logger';
```

We need to add an instance of the `DiscordLogger` to the logger chain, and the best place to do this is from the plugin's constructor
```typescript
class MyPlugin {
  constructor() {
    const discordLogger = new DiscordLogger('your_bot_token');
    Logger.addLogger(discordLogger);
  }
}
```
Now, if we want to send a message to discord, we can simply use the `log` method with the channel id of the channel we want to send a message to, and the `DiscordMessageLevel` as the level.
```typescript
Logger.log(myChannelId, 'Hello, Discord!', DiscordMessageLevel);
```

### Complete code
```typescript
import * as Discord from 'discord.js';
import { LogProvider, LogLevel, Logger } from '../services';

export const DiscordMessageLevel = 999;

export class DiscordLogger implements LogProvider {

  private client: Discord.Client;
  private ready = false;

  constructor(token: string) {
    this.client = new Discord.Client();
    this.client.login(token);
    // The ready event only happens once, so 'once' can be used instead of 'on'.
    this.client.once('ready', () => this.ready = true);
    this.client.on('error', (error) => {
      // we can rely on the other loggers in the logging chain to log this error.
      Logger.log('DiscordLogger', `An error occurred: ${error.message}`, LogLevel.Error);
    });
  }

  log(sender: string, message: string, level: LogLevel): void {
    // don't try to log unless it's a discord message.
    if (level !== DiscordMessageLevel) {
      return;
    }
    // don't try to log if the bot is not ready.
    if (!this.ready) {
      return;
    }
    const channel = this.client.channels.get(sender);
    // make sure the channel exists.
    if (!channel) {
      Logger.log('DiscordLogger', `Channel ${sender} does not exist.`, LogLevel.Warning);
      return;
    }
    // cast the channel to a TextChannel so we can call 'send'.
    (channel as Discord.TextChannel).send(message).catch((error) => {
      // make sure to catch any errors.
      Logger.log('DiscordLogger', `Error while sending a message: ${error.message}`, LogLevel.Error);
    });
  }
}

```
