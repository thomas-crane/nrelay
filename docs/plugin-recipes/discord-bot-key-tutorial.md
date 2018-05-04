# Key Notifier via Discord bot tutorial
This recipe will demonstrate how to create a key notifier that messages you through discord.

## Setup
Start by creating the file `key-notifier.ts` in the `src/plugins` folder. We can start with the plugin template provided in the `creating-plugins` doc. We can remove the `Update` packet hook since we don't need it.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager} from './../core/plugin-module';

@NrPlugin({
    name: 'Key Notifier',
    author: 'Lolization'
})
class KeyNotifier {

}

```
Next, we will want to know when a key is being popped. You can get this information via a textPacket, and read if the text says it is a key being popped.
We will need to import `TextPacket` from `packets/incoming/text-packet` for that purpose.
You can tell that a key is popped using a regex and comparing it to `textPacket.text`
```typescript
class KeyNotifier {
    private dngRegex = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;
    @HookPacket(PacketType.TEXT);
    onTextPacket(client: Client, textPacket: TextPacket): void {

        // Check if a key is popped
        const match = this.dngRegex.exec(textPacket.text);
        if (match) {
            
        }
    }
```
Now, we will want the bot to tell the discord bot when a key is being popped. To do so, we can create a function that will send the message on discord, which will execute when we have a match. But first, we will need to create the bot itself.
To create a discord bot, you will need to install the `discord.js` npm module to create and run the bot. In the console, type the command:
```bash
npm install discord.js
```
We can now import the discord module.
```typescript
import Discord = require('discord.js');
```
If you are new to discord bots, you can create a discord bot with [this tutorial](https://twentysix26.github.io/Red-Docs/red_guide_bot_accounts/#creating-a-new-bot-account).
Next up we create our bot and login with it. We will want to put it inside the class constructor so we can use the bot inside the class.
```typescript
private dngRegex = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;
private bot: Discord.Client;
constructor() {
    const bot = new Discord.Client();
    bot.login('your-token');
}
```
After creating our discord bot, we can create a function that will send a message on discord. The function will get the name and location of the dungeon as parameters and write the message.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core/plugin-module';
import { TextPacket } from '../networking/packets/incoming/text-packet';

@NrPlugin({...})

class KeyNotifier {

    @HookPacket(PacketType.TEXT)
    
    onTextPacket(client: Client, textPacket: TextPacket): void {
        
        // Check if a key is popped
        const match = this.dngRegex.exec(textPacket.text);
        if (match) {
            this.callDungeon(match[1], match[2], client.server);
        }
    }
    
    callDungeon(name: string, opener: string, server: IServer): void {
        this.bot.channels.get('Channel-ID').send(`${name} opened by ${opener} in ${server.name}`)
    }
}
```
To prevent any errors regarding the discord bot not being connected, we can create a boolean that will be set to true only when the discord bot is connected
```typescript
Class KeyPlugin {
    private dngRegex = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;
    private bot: Discord.Client;
    private ready = false;
    constructor() {
        this.bot = new Discord.Client();
        this.bot.login(token);
        this.bot.on('ready', () => this.ready = true);
    }
    ......
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
// These 5 imports are essential for any plugin. Log and LogLevel to log to the console.
import { NrPlugin, HookPacket, Packet, PacketType, Client, Log, LogLevel } from './../core/plugin-module';

// Import the TextPacket
import { TextPacket } from '../networking/packets/incoming/text-packet';
import { IServer } from './../models/server';


// Import the discord api
const Discord = require('discord.js');

/**
* The bot's token
*/
const token = 'bot-token';

// The NrPlugin decorator gives nrelay some information about
// your plugin. If it is not present, nrelay won't load the plugin.
@NrPlugin({
    name: 'Key Notifier Plugin',
    author: 'Lolization'
})
class KeyPlugin {

    private dngRegex = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;
    private bot: Discord.Client;
    private ready = false;

    constructor() {
        this.bot = new Discord.Client();
        this.bot.login(token);
        this.bot.on('ready', () => this.ready = true);
    }

    // The HookPacket decorator will cause the method to be called
    // whenever a packet with the specified packet type is recieved.
    @HookPacket(PacketType.TEXT)
    // Any method with a HookPacket decorator should always have
    // the method signature (client: Client, packet: Packet).
    onTextPacket(client: Client, textPacket: TextPacket): void {

        // Check if a key is opened
        const match = this.dngRegex.exec(textPacket.text);
        if (match) {
            this.callDungeon(match[1], match[2], client.server);
        }
    }
    
    /**
     * Sends a message to the discord server that a dungeon was opened.
     * @param name The name of the dungeon
     * @param opener The name of the opener
     * @param server The name of the server
     */
    callDungeon(name: string, opener: string, server: IServer): void {
        if (!this.ready) {
            return;
        }
        this.bot.channels.get('ChannelID').send(`${name} opened by ${opener} in ${server.name}`)
    }
}
```
I also made it so the message gets deleted after 30 seconds (when the portal is closed) and 5 seconds before that, it edits the message to have a "(closing)" at the end.
You can add that by fetching the message upon sending it and using `.then` to edit it and delete it.
```typescript
bot.channels.get('Channel-ID').send(`${dngName} opened by ${dngOpener} in ${dngServer}`)
    .then((msg: Discord.Message) {
        setTimeout(() => {
            msg.edit(msg.content + ` (closing)`);
        }, 25000);
        setTimeout(() => {
            msg.delete();
        }, 30000);
    })
```
