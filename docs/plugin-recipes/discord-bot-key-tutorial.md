# Discord key notifier
This recipe will demonstrate how to create a key notifier that messages you through discord. To do this, we will build the `Key Notifier` plugin and use the discord.js npm module. The aim of the plugin will be to notice when a portal has been opened in the nexus, and send a notification to a discord channel.

## Setup
Start by creating the file `key-notifier.ts` in the `src/plugins` folder. We can start with the plugin template provided in the `creating-plugins` doc. We can remove the `Update` packet hook since we don't need it.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager} from './../core';

@NrPlugin({
    name: 'Key Notifier',
    author: 'Lolization',
    enabled: true
})
class KeyNotifier {

    constructor() {

    }

}

```

Before we can send any messages to discord, we first need to detect when a key is used in the Nexus. To do this, we can listen for any `TextPacket`s which contain the portal open mesage.
These messages are displayed nicely on the client, but are actually sent as a JSON payload over the network. To detect when one of these payloads are received, we will use a simple regular expression. Since the RegExp will never change, we can declare it as a `const` at the top level.

We will also be using the `TextPacket` class in a moment, so we can import that too.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager} from './../core';
import { TextPacket } from './../networking/packets/incoming/text-packet';

const PORTAL_REGEX = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;
```

Next, we can add the packet hook for the text packet, and test if the packet contained the JSON payload.
```typescript
class KeyNotifier {

    constructor() {

    }

    @HookPacket(PacketType.TEXT)
    onText(client: Client, textPacket: TextPacket): void {
        const match = PORTAL_REGEX.exec(textPacket.text);

        if (match) {
            // the text contains the JSON payload.
        }
    }

}
```

Now that we can detect when a key is used, we are ready to set up discord.js so we can send messages to a server.

First, install the `discord.js` npm module. You may receive some warnings about unmet peer dependencies when you do this, but these can be safely ignored. `bufferutil` is an optional dependency which improves performance, so we'll install that too.
```bash
npm install bufferutil discord.js
```

We can now import the discord module.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager } from './../core';
import { TextPacket } from './../networking/packets/incoming/text-packet';

import Discord = require('discord.js');
```

Next, we can create our bot and login with it.
If you are new to discord bots, you can create a discord bot with [this tutorial](https://twentysix26.github.io/Red-Docs/red_guide_bot_accounts/#creating-a-new-bot-account).
```typescript
class KeyNotifier {
    private bot: Discord.Client;

    constructor() {
        this.bot = new Discord.Client();
        this.bot.login('your-token-here');
    }
}
```
`'your-token-here'` should be replaced with your own discord bot token.

After declaring our discord bot, we can create a function that will send a message to discord. The function will take the name and location of the portal as parameters. We will also add a call to that function in our text packet hook.
```typescript
@HookPacket(PacketType.TEXT)
onText(client: Client, textPacket: TextPacket): void {
    const match = PORTAL_REGEX.exec(textPacket.text);

    if (match) {
        // the text contains the JSON payload.
        const portalType = match[1];
        const opener = match[2];
        this.callDungeon(portalType, opener, client.server);
    }
}

callDungeon(name: string, opener: string, server: IServer): void {
    this.bot.channels.get('your-channel-id').send(`${name} opened by ${opener} in ${server.name}`)
}
```
`'your-channel-id'` should be replaced with the channel id of the channel you want to send messages to.

At this point we have 2 errors: `Property 'send' does not exist on type 'Channel'.`, and `Cannot find name 'IServer'.`. To fix the `IServer` error, we simply need to import `IServer`.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager } from './../core';
import { TextPacket } from './../networking/packets/incoming/text-packet';
import Discord = require('discord.js');

import { IServer } from './../models/server';
```

To fix the other error, we need to be more specific about the type of channel we are `.send`ing a message to. Discord has several types of channels such as text channels and voice channels. Because we are sending a text message, we want to use the `Discord.TextChannel` type of channel.
```typescript
callDungeon(name: string, opener: string, server: IServer): void {
    (this.bot.channels.get('your-channel-id') as Discord.TextChannel)
        .send(`${name} opened by ${opener} in ${server.name}`)
}
```
Note that the `.send` part was moved to a new line. This was done because if it is all on one line, the line becomes very long and unreadable. Functionally, there is **no difference** between having the code on one line, or on two lines.

There is one last thing left to do before running the bot, and that's making sure the bot is ready to send messages before we try to send any. Discord.js lets you know when the bot is ready through an event emitter which we will attach a listener to. We will also add a `ready` boolean to our class so the `callDungeon` function knows when the bot is ready too.

```typescript
class KeyPlugin {
    private bot: Discord.Client;
    private ready = false;

    constructor() {
        this.bot = new Discord.Client();
        this.bot.login('your-token-here');
        this.bot.once('ready', () => this.ready = true);
    }

    ...

    callDungeon(name: string, opener: string, server: IServer): void {
        if (!this.ready) {
            return;
        }
        this.bot.channels.get('channel-ID').send(`${name} opened by ${opener} in ${server.name}`)
    }
}
```

The final file should look like this:
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager } from './../core';
import { TextPacket } from './../networking/packets/incoming/text-packet';
import { IServer } from './../models/server';
import Discord = require('discord.js');

const PORTAL_REGEX = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;

@NrPlugin({
    name: 'Key Notifier',
    author: 'Lolization',
    enabled: true
})
class KeyNotifier {
    private bot: Discord.Client;
    private ready = false;

    constructor() {
        this.bot = new Discord.Client();
        this.bot.login('your-token-here');
        this.bot.once('ready', () => this.ready = true);
    }

    @HookPacket(PacketType.TEXT)
    onText(client: Client, textPacket: TextPacket): void {
        const match = PORTAL_REGEX.exec(textPacket.text);

        if (match) {
            // the text contains the JSON payload.
            const portalType = match[1];
            const opener = match[2];
            this.callDungeon(portalType, opener, client.server);
        }
    }

    callDungeon(name: string, opener: string, server: IServer): void {
        if (!this.ready) {
            return;
        }
        (this.bot.channels.get('your-channel-id') as Discord.TextChannel)
            .send(`${name} opened by ${opener} in ${server.name}`);
    }
}

```

The plugin's aim of sending discord messages when a portal is opened has now been fulfilled. However, the plugin can be still be extended to provide a new feature.

Since portals close after 30 seconds, we can add a timer to automatically delete the message after this time. We will also add a timer to add a closing warning 5 seconds before the portal will close.
To do this, we can add a function which will be called when the message is sent to discord. The function will be called and passed the message that was sent as its parameter.

We will also add an error handler, to report if the bot failed to send the message to discord.

```typescript
(this.bot.channels.get('your-channel-id') as Discord.TextChannel)
    .send(`${name} opened by ${opener} in ${server.name}`)
    .then((msg: Discord.Message) => {
        // msg was successfully sent to discord.
    })
    .catch((error: Error) => {
        // msg was not sent to discord.
    });
```

In our `.then` function, we can add two `setTimeout` calls, which will call the given function after the specified amount of time.
```typescript
.then((msg: Discord.Message) => {
    // msg was successfully sent to discord.
    setTimeout(() => {
        msg.edit(`${msg.content} (closing)`);
    }, 25000); // called after 25 seconds
    setTimeout(() => {
        msg.delete();
    }, 30000); // called after 30 seconds
})
```

In the `.catch` part, we will just log the error that occurred. To do this we first need to add `Log` and `LogLevel` to our imports.
```typescript
import { Log, LogLevel, NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager } from './../core';
//       ^^^^^^^^^^^^^ New imports.
```

Then we can add the log messages.
```typescript
.catch((error: Error) => {
    Log('Key Notifier', 'An error occurred while sending the message to discord.', LogLevel.Warning);
    Log('Discord Error', error.message, LogLevel.Error);
});
```
