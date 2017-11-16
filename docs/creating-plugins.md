# Creating Plugins

__Hotlinks__
___
+ [Plugin template](#plugin-template)

## Foreword
Creating custom plugins for nrelay is a simple process. The first thing to do is create the plugin in the right place in order to allow nrelay to find it at runtime.

All plugins should be inside the `src/plugins` folder. When the TypeScript is compiled, the plugins will be compiled to JavaScript and placed in `dist/plugins`. If you want to distribute your plugin, you can distribute either the `.ts` source file from `src/plugins`, or the `.js` source file from `dist/plugins`.

__Note:__ The `src/plugins` folder should only ever contain `.ts` files, and `dist/plugins` should only contain `.js` files. Be cautious of directly editing any files in the `dist` directory as they will be replaced by the compiled TypeScript source files when the next build occurs.

## Creating your first plugin
To demonstrate how to create plugins and interact with packets/player data this guide will cover how to recreate the Hello Plugin which is included by default with nrelay. The Hello Plugin is a simple plugin which replies to anyone who sends the message 'hello' to the bot.

To get started, first delete the contents of the file `src/plugins/hello-plugin.ts`.

The first step of creating a plugin is to import some types from nrelay in order to declare the plugin. __All plugins needs these 4 imports__:
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';
```

Now that we have the essentials imported, we can declare the plugin class.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';

export default class HelloPlugin {

}
```
`export default ...` is required in order for the nrelay plugin manager to properly initialize the plugin.

In order for nrelay to recognize this class as a plugin, it needs to be decorated using the `NrPlugin` decorator. The `NrPlugin` decorator requires an object parameter which is used to describe the plugin.
```typescript
@NrPlugin({ name: 'Hello plugin', author: 'tcrane' })
export default class HelloPlugin {

}
```
This is the bare essentials for a plugin. You can verify that nrelay recognizes this plugin by building the source and running nrelay
```bash
C:\Documents\nrelay>tsc
C:\Documents\nrelay>nrelay
[NRelay] Starting...
[PluginManager] Loaded Hello Plugin by tcrane
```
If you don't see the line `[PluginManager] Loaded Hello Plugin by tcrane`, it means nrelay wasn't able to recognize the plugin. If this happens you should ensure that the `hello-plugin.ts` file is in the `src/plugins` directory.

Now that we have a working plugin we can start adding packet hooks. Packet hooks are methods which will be called whenever a certain packet is received. All packet hook method need to have the same method signature, which is
```typescript
myPacketHookMethod(client: Client, packet: Packet): void {
    ...
}
```
It doesn't matter if the parameters aren't _called_ `client` and `packet`, as long as their _type_ is `Client` and `Packet` respectively.

### Important note:
Because all of the specific packets (such as `UpdatePacket` or `NewTickPacket`) are subclasses of the `Packet` class, the specific packet types can be used in the packet hook signature. This means that, for example if you are trying to hook the `UpdatePacket` you can use
```typescript
hookUpdate(client: Client, updatePacket: UpdatePacket) {
    ...
}
```
instead of
```typescript
hookUpdate(client: Client, packet: Packet) {
    const updatePacket = packet as UpdatePacket;
    ...
}
```
The hello packet needs to respond to the text packet, so a packet hook method needs to be added for the text packet
```typescript
@NrPlugin({ name: 'Hello plugin', author: 'tcrane' })
export default class HelloPlugin {

    public onTextPacket(client: Client, packet: Packet): void {

    }
}
```
Similarly to the plugin class itself, nrelay doesn't know about the packet hook method yet. This is where the `HookPacket` decorator is used. The `HookPacket` decorator requires a `PacketType` enum value as a parameter. A number can be used, but is not recommended as the packet type numbers can change when RotMG is updated.
`PacketType` is simply an enum containing all packets which can be hooked.
```typescript
@NrPlugin({ name: 'Hello plugin', author: 'tcrane' })
export default class HelloPlugin {

    @HookPacket(PacketType.Text)
    public onTextPacket(client: Client, packet: Packet): void {

    }
}
```
Now that the HookPacket decorator is present, nrelay will be able to detect this method and will call it any time a text packet is received. The method will be called with the `Client` instance which received the packet, and the packet itself as a `Packet` object.

In order to access the text packet properties, we need to cast the `packet` parameter to the correct type. To do this we first need to import the type of packet we want to cast to. In this case we want to use the `TextPacket` so we need to add another import to the top of the file
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';

import { TextPacket } from './../networking/packets/incoming/text-packet'; // Add this line.
```
Because the `TextPacket` type is a subclass of the `Packet` type, we can simply specify the parameter's type as the subclass `TextPacket`. This will implicitly cast the packet to a `TextPacket` object.
```typescript
@HookPacket(PacketType.Text)
public onTextPacket(client: Client, textPacket: TextPacket): void {

}
```
The text packet properties such as `text` and `name` can now be accessed. In order to check if the packet was a PM for the client, we need to check the `recipient` property
```typescript
@HookPacket(PacketType.Text)
public onTextPacket(client: Client, textPacket: TextPacket): void {

    if (textPacket.recipent === client.playerData.name) {
        // text packet was a private message to the client.
    } else {
        // text packet was not a private message.
    }
}
```
Now we just need to check if the message was 'hello'
```typescript
if (textPacket.recipent === client.playerData.name) {
    if (textPacket.text === 'hello') {
        // send a reply!
    }
}
```
To send a message we need to use the `PlayerTextPacket` which needs to be imported. Once again, add another import to the top of the file
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';

import { TextPacket } from './../networking/packets/incoming/text-packet';
import { PlayerTextPacket } from './../networking/packets/outgoing/playertext-packet'; // Add this line.
```
Now all that is left to do is create a new `PlayerTextPacket`, set the text and then send it.
```typescript
if (textPacket.recipent === client.playerData.name) {
    
    if (textPacket.text === 'hello') {
        // Create the packet.
        const replyTextPacket = new PlayerTextPacket();

        // Set the text property to '/tell <yourname> Hello!'.
        replyTextPacket.text = '/tell' + textPacket.name + ' Hello!';

        // Send the packet.
        client.packetio.sendPacket(replyTextPacket);
    }
}
```
The entire plugin file should now look similar to the following
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';

import { TextPacket } from './../networking/packets/incoming/text-packet';
import { PlayerTextPacket } from './../networking/packets/outgoing/playertext-packet';

@NrPlugin({
    name: 'Hello Plugin',
    author: 'tcrane'
})
export default class HelloPlugin {

    @HookPacket(PacketType.Text)
    onText(client: Client, textPacket: TextPacket): void {

        if (textPacket.recipent === client.playerData.name) {

            if (textPacket.text === 'hello') {

                const reply = new PlayerTextPacket();
                reply.text = '/tell ' + textPacket.name + ' Hello!';

                client.packetio.sendPacket(reply);
            }
        }
    }
}

```
To test the plugin, first compile the TypeScript using the command
```bash
tsc
```
Then run nrelay using
```bash
nrelay
```
Now, use the regular RotMG client and a second account to send a /tell to the account logged in on nrelay. If you send the text `/tell <yourname> hello` You should receive the reply `<yourname> Hello!`.

## The next step
Now that the client is working and responding to commands, more functionality can be added through the use of variables.
To demonstrate variables and a few other topics we will add a new command for the bot to respond to.

The goal is to add a command which will change the response of the bot when we use the `hello` command.

To do this, we should use a variable to store the bot's response message.
```typescript
@NrPlugin({
    name: 'Hello Plugin',
    author: 'tcrane'
})
export default class HelloPlugin {

    private response: string;

    @HookPacket(PacketType.Text)
    onText(client: Client, textPacket: TextPacket): void {
        ...
    }
}
```
Then we can update the reponse code to use the `response` variable instead of the hard coded string `hello`.
```typescript
if (textPacket.text === 'hello') {
    
    const reply = new PlayerTextPacket();
    reply.text = '/tell ' + textPacket.name + ' ' + this.response;
    
    client.packetio.sendPacket(reply);
}
```
Notice that the keyword `this` is used to access the variable. Any variables declared within the scope of the class should be accessed with `this`.

Now we need to add an if statement to detect a new keyword to change the response message. However this time we also need to detect the command's argument, which is the new reposnse message. A simple way to do this is to use regex.

Regex won't be explained in a lot of detail here, but [regexr.com](https://regexr.com/) is a great resource to learn and create regex.

We can use another variable to store the regex in case it ever needs to change.
```typescript
@NrPlugin({
    name: 'Hello Plugin',
    author: 'tcrane'
})
export default class HelloPlugin {

    private response: string;
    private setRegex = /^set\s+(\S+.*)$/;

    @HookPacket(PacketType.Text)
    onText(client: Client, textPacket: TextPacket): void {
        ...
    }
}
```
In short, this regex matches any string which starts with `set` and then has at least one character. For example this will match strings like
```
"set Hello There!"     --> returns "Hello There!"
"set     Spaces!!"     --> returns "Spaces!!"
"set       "           --> returns null
"set "                 --> returns null
"set !@(*#&) test 123" --> returns "!@(*#&) test 123"
```
Now we can use the regex to detect the command
```typescript
@HookPacket(PacketType.Text)
onText(client: Client, textPacket: TextPacket): void {

    if (textPacket.recipent === client.playerData.name) {
        ....
    }
    const match = this.setRegex.match(textPacket.text);
    if (match) {
        this.reponse = match[1];
        const reply = new PlayerTextPacket();
        reply.text = '/tell ' + textPacket.name + ' set response to ' + this.response;
        client.packetio.sendPacket(reply);
    }
}
```
If the regex matches the text, the matched group of the regex will be `match[1]`.

There is one more thing to do before we can test the command. When the plugin starts, the variable `response` will be `null`. To give it a default value, we will use the `constructor`. This will only be called once when the plugin loads, so it should be used for initialisation of variables.
```typescript
@NrPlugin({
    name: 'Hello Plugin',
    author: 'tcrane'
})
export default class HelloPlugin {

    private response: string;
    private setRegex = /^set\s+(\S+.*)$/;

    constructor() {
        this.respnse = 'Default response';
    }

    @HookPacket(PacketType.Text)
    onText(client: Client, textPacket: TextPacket): void {
        ...
    }
}
```
Now that `reponse` has a default value, we can test the plugin.

To test the command, rebuild and run nrelay
```bash
tsc
```
```bash
nrelay
```

Now, use the regular RotMG client and a second account to send a /tell to the account logged in on nrelay. If you send the text `/tell <yourname> hello` You should now receive the reply `<yourname> Default response`

Now, if you send the bot `/tell <yourname> set New reposnse text` it should reply `<yourname> set response to New response text`

If you try the `hello` command again, it should now say `<yourname> New response text`

## The Logger class
If you need to print out some information for debugging or logging purposes, you should use the `Log` method.
Normally, you could use something like
```typescript
console.log('Player name: ' + client.playerData.name);

// prints
//
// Player name: Eendi
//
```
The `Logger` class allows you to log messages with senders and log levels.
Firstly, you need to import the `Logger` class exports
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, Log, SeveryityLevel } from './../core/plugin-module';
//                                                         ^^^^^^^^^^^^^^^^^^^
```
`SeverityLevel` is an enum which describes the type of message you are trying to log. It consists of
```typescript
enum SeverityLevel {
    Info,
    Message,
    Warning,
    Error,
    Success,
}
```
The default value is `Message`, so to log a message you can use
```typescript
Log('MyPlugin', 'Player name: ' + client.playerData.name);

// prints
//
// [MyPlugin] Player name: Eendi
//
```
The severity level can be provided as a third argument to change the color of the message.
```
   Info = Dark gray
Message = White
Warning = Yellow
  Error = Red
Success = Green
```
For example:
```typescript
try {
    this.methodThatThrowsError();
} catch (error) {
   Log('MyPlugin', 'Error: ' + error.Message, SeverityLevel.Error); 
}
```
Will print the error message in red.

## Plugin template
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client } from './../core/plugin-module';

import { UpdatePacket } from './../networking/packets/incoming/update-packet';

@NrPlugin({
    name: 'Your Plugin Name',
    author: 'Your Name'
})
export default class YourPluginName {

    constructor () {

    }

    @HookPacket(PacketType.Update)
    onUpdate(client: Client, updatePacket: UpdatePacket): void {

    }
}
```