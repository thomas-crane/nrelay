# The Discord logger

A common use case for nrelay is to send messages to a Discord server. We can implement a custom logger to make an easy to use, and reusable discord utility.

For this example, we will use the Discord.js npm module, which should be installed before we start writing the logger.

```bash
npm install discord.js --save
```

Let's start by creating a new file in our project's `src/` folder called `discord-logger.ts`.

We can start by importing the Discord.js module and some logger exports.

```ts
import * as Discord from 'discord.js';
import { LogProvider, LogLevel, Logger } from 'nrelay';
```

We can now declare our class, inherit from `LogProvider`, and implement the required methods as stubs for now. We should also `export` our class, since we may want to create the logger and add it to the logging chain from one of our plugins.

```ts
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

```ts
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

```ts
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

```ts
export class DiscordLogger implements LogProvider {
  // -- snip --

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
}
```

The code may look finished at this point, but there is currently a **huge flaw** in the `log` method! The flaw may already be obvious, but don't worry if it isn't. We'll fix it now.

To demonstrate the flaw, imagine what will happen if one of the clients logs a message. The `sender` will be the client's alias, and since the client's alias is *probably* not a discord channel id, this piece of code will be executed:

```ts
if (!channel) {
  Logger.log('DiscordLogger', `Channel ${sender} does not exist.`, LogLevel.Warning);
  return;
}
```

This code might seem harmless at a glance, but we're calling `log` again, and this time the `sender` is `'DiscordLogger'`. That string is *definitely* not a discord channel id, so this code will be executed again. It should now be obvious that this code will continue to be executed again and again until we get a `RangeError: Maximum call stack size exceeded`.

So what is the solution? We could just remove the log message, but then if we do use a real channel id as the `sender`, but make a small typo, we have no indication of what the problem is.

Recall that the `log` method also accepts arbitrary numbers as the `level` parameter. We can define our own special number for discord messages, and then just ignore any other level. Problem solved!

```ts
export const DiscordMessageLevel = 999;

export class DiscordLogger implements LogProvider {
  // -- snip --
}
```

```ts
export class DiscordLogger implements LogProvider {
  // -- snip --

  log(sender: string, message: string, level: LogLevel): void {
    // don't try to log unless it's a discord message.
    if (level !== DiscordMessageLevel) {
      return;
    }
    // -- snip --
  }
}
```

Now that this problem is solved, we are ready to use the `DiscordLogger` in one of our plugins.

In a plugin where you want to use the discord logger, first import it.

```ts
// this assumes that the logger is in the file 'discord-logger.ts'
import { DiscordLogger, DiscordMessageLevel } from './discord-logger';
```

We need to add an instance of the `DiscordLogger` to the logger chain, and the best place to do this is from the plugin's constructor

```ts
class MyPlugin {
  constructor() {
    const discordLogger = new DiscordLogger('your_bot_token');
    Logger.addLogger(discordLogger);
  }
}
```

Now, if we want to send a message to discord, we can simply use the `log` method with the channel id of the channel we want to send a message to, and the `DiscordMessageLevel` as the level.

```ts
Logger.log(myChannelId, 'Hello, Discord!', DiscordMessageLevel);
```

## Complete code

```ts
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
