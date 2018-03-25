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
Now, we will want the bot to tell the discord bot when a key is being popped. So we can add variables that will hold information on the key, and the discord bot will write to us.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core/plugin-module';
import { TextPacket } from '../networking/packets/incoming/text-packet';

let dngName = '';
let dngOpener = '';
let dngServer = '';

@NrPlugin({...})

class KeyNotifier {

    @HookPacket(PacketType.TEXT)
    
    onTextPacket(client: Client, textPacket: TextPacket): void {
        
        // Check if a key is popped
        const match = this.dngRegex.exec(textPacket.text);
        if (match) {
            dngName = match[1];
            dngOpener = match[2];
            dngServer = client.server.name;
        }
    }
}
```




After we finished finding the keys being popped, we will build our discord bot. To do this, you will need to install the `discord.js` npm module to create and run the bot. In the console, type the command:
```bash
npm install discord.js
```
We can now define Discord and create our discord bot:
```typescript
const Discord = require('discord.js');
const bot = new Discord.Client();
```
If you are new to discord bots, you can create a discord bot with [this tutorial](https://twentysix26.github.io/Red-Docs/red_guide_bot_accounts/#creating-a-new-bot-account).
Next, login with the token provided for your discord bot:
```typescript
bot.login('your-token');
```
Now, you would want your bot to get the variables you defined for the dungeon and send a message with those variables to your server. To do this, you will need to run the bot and every second check if a key was popped.
You can set an interval that will run every second or so, and let it check the variables if they are empty or not
```typescript
bot.on('ready', () => {
    setInterval(function() {
        // Check if the variables have a value
        if (dngServer.length > 0) {

        }
    }, 500);
})
```
After seeing that the values aren't empty, you will want to use the values and send a message to the server/yourself.

```typescript
if (dngServer.length > 0) {
    bot.channels.get('channel-id').send(`${dngName} opened by ${dngOpener} in ${dngServer}`)
}
```
You will want to reset the dungeon variables back to being empty (`''`) so it won't resend the same dungeon.
Don't forget to add the bot to your server!

The final file should look like this:
```typescript
// These 5 imports are essential for any plugin.
import { NrPlugin, HookPacket, Packet, PacketType, Client} from './../core/plugin-module';

// Import the TextPacket
import { TextPacket } from '../networking/packets/incoming/text-packet';

// Define the dungeon variables.
let dngName = '';
let dngOpener = '';
let dngServer = '';

// Create a discord bot
const Discord = require('discord.js');
const bot = new Discord.Client();

// Add the token
bot.login('token');

// Run the bot
bot.on('ready', () => {
    setInterval(function() {
        // Check if there is a dungeon opened
        if (dngServer.length > 0) {
            bot.channels.get('channel-id').send(`${dngName} opened by ${dngOpener} in ${dngServer}`)
            dngName = '';
            dngOpener = '';
            dngServer = '';
        }
    }, 500);
})
// The NrPlugin decorator gives nrelay some information about
// your plugin. If it is not present, nrelay won't load the plugin.
@NrPlugin({
    name: 'Key Notifier Plugin',
    author: 'DavisXola'
})
class KeyPlugin {

    private dngRegex = /^{"key":"server.dungeon_opened_by","tokens":{"dungeon":"(\S.*)", "name":"(\w+)"}}$/;

    // The HookPacket decorator will cause the method to be called
    // whenever a packet with the specified packet type is recieved.
    @HookPacket(PacketType.TEXT)
    // Any method with a HookPacket decorator should always have
    // the method signature (client: Client, packet: Packet).
    onTextPacket(client: Client, textPacket: TextPacket): void {

        // Check if a key is opened
        const match = this.dngRegex.exec(textPacket.text);
        if (match) {
            dngName = match[1];
            dngOpener = match[2];
            dngServer = client.server.name;
        }
    }
}
```
I also made it so the message gets deleted after 30 seconds (when the portal is closed) and 5 seconds before that, it edits the message to have a "(closing)" at the end.
You can add that by fetching the message upon sending it and using `.then` to edit it and delete it.
```typescript
bot.channels.get('426565182718738445').send(`${ping} ${dngName} opened by ${dngOpener} in ${dngServer}`)
    .then(function (msg) {
        setTimeout(() => {
            msg.edit(msg.content + ` (closing)`);
        }, 25000);
        setTimeout(() => {
            msg.delete();
        }, 30000);
    })
```
**Warning: Using the `.then` and getting the message can only work if you change `noImplicitAny` from `true` to `false` in `tsconfig.json`**
