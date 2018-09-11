# Creating Plugins

### Contents
 + [Creating your first plugin](#creating-your-first-plugin)
 + [The next step](#the-next-step)
 + [The Logger class](#the-logger-class)
 + [Advanced Topic - Plugin Interop](#plugin-interop)
 + [Plugin template](#plugin-template)

## Foreword
Creating custom plugins for nrelay is a simple process. The first thing to do is create the plugin in the right place in order to allow nrelay to find it at runtime.

All plugins should be inside the `src/plugins` folder. When the TypeScript is compiled, the plugins will be compiled to JavaScript and placed in `dist/plugins`. If you want to distribute your plugin, you can distribute either the `.ts` source file from `src/plugins`, or the `.js` source file from `dist/plugins`.

__Note:__ The `src/plugins` folder should only ever contain `.ts` files, and `dist/plugins` should only contain `.js` files. Be cautious of directly editing any files in the `dist` directory as they will be replaced by the compiled TypeScript source files when the next build occurs.

## Creating your first plugin
To demonstrate how to create plugins and interact with packets/player data this guide will cover how to recreate the Hello Plugin which is included by default with nrelay. The Hello Plugin is a simple plugin which replies to anyone who sends the message 'hello' to the bot.

To get started, first delete the contents of the file `src/plugins/hello-plugin.ts`.

The first step of creating a plugin is to import some types from nrelay in order to declare the plugin. __All plugins need these imports__:
```typescript
import { Library, PacketHook, Client } from './../core';
```

Now that we have the essentials imported, we can declare the plugin class.
```typescript
import { Library, PacketHook, Client } from './../core';

class HelloPlugin {

}
```

In order for nrelay to recognize this class as a plugin, it needs to be decorated using the `Library` decorator. The `Library` decorator requires an object parameter which is used to describe the plugin.
```typescript
@Library({ name: 'Hello plugin', author: 'tcrane' })
class HelloPlugin {

}
```
If the `@Library` decorator is not present, the plugin will not be loaded. A `description` can optionally be included to describe the plugin, and `enabled` can be used to tell nrelay whether or not to load the plugin
```typescript
// this plugin will be loaded
@Library({
    name: 'CoolPlugin',
    author: 'tcrane',
    description: 'A cool plugin'
    enabled: true
})
class CoolPlugin {
    ...
}

// this plugin won't be loaded
@Library({
    name: 'CoolPlugin',
    author: 'tcrane',
    enabled: false
})
class UnusedPlugin {
    ...
}
```
All plugins are enabled by default, so if `enabled` is not included, the plugin will still load anyway.

These are the bare essentials for a plugin. You can verify that nrelay recognizes this plugin by building the source and running nrelay
```bash
C:\Documents\nrelay>gulp
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

The hello packet needs to respond to the text packet, so a packet hook method needs to be added for it.
```typescript
@Library({ name: 'Hello plugin', author: 'tcrane' })
class HelloPlugin {

    public onTextPacket(client: Client, packet: Packet): void {

    }
}
```
nrelay's packet hook system relies on specific packet types being used to call the packet hooks at the right time, so using a general type like `Packet` will not work. We will fix this problem in a moment.

Similarly to the plugin class itself, nrelay doesn't know about the packet hook method yet. This is where the `PacketHook` decorator is used.
```typescript
@Library({ name: 'Hello plugin', author: 'tcrane' })
class HelloPlugin {

    @PacketHook()
    public onTextPacket(client: Client, packet: Packet): void {

    }
}
```
Now that the `PacketHook` decorator is present, nrelay will be able to detect this method, but doesn't yet know when to call it. To give nrelay the information it needs, we need to use a specific packet type in the method signature.

To do this we first need to import the type of packet we want to hook. In this case we want to use the `TextPacket` so we need to add another import to the top of the file.
```typescript
import { Library, PacketHook, Client } from './../core';

import { TextPacket } from './../networking/packets/incoming'; // Add this line.
```
Now, we can simply specify the parameter's type as `TextPacket`.
```typescript
@PacketHook()
public onTextPacket(client: Client, textPacket: TextPacket): void {

}
```
The text packet properties such as `text` and `name` can now be accessed, and nrelay now knows to call this method whenever it receives a `TextPacket`. In order to check if the packet was a PM for the client, we need to check the `recipient` property
```typescript
@PacketHook()
public onTextPacket(client: Client, textPacket: TextPacket): void {

    if (textPacket.recipient === client.playerData.name) {
        // text packet was a private message to the client.
    } else {
        // text packet was not a private message.
    }
}
```
Now we just need to check if the message was 'hello'
```typescript
if (textPacket.recipient === client.playerData.name) {
    if (textPacket.text === 'hello') {
        // send a reply!
    }
}
```
To send a message we need to use the `PlayerTextPacket` which needs to be imported. Once again, add another import to the top of the file
```typescript
import { Library, PacketHook, Client } from './../core';

import { TextPacket } from './../networking/packets/incoming';
import { PlayerTextPacket } from './../networking/packets/outgoing'; // Add this line.
```
Now all that is left to do is create a new `PlayerTextPacket`, set the text and then send it.
```typescript
if (textPacket.recipient === client.playerData.name) {
    
    if (textPacket.text === 'hello') {
        // Create the packet.
        const replyTextPacket = new PlayerTextPacket();

        // Set the text property to '/tell <yourname> Hello!'.
        replyTextPacket.text = '/tell ' + textPacket.name + ' Hello!';

        // Send the packet.
        client.packetio.sendPacket(replyTextPacket);
    }
}
```
The entire plugin file should now look similar to the following
```typescript
import { Library, PacketHook, Client } from './../core';

import { TextPacket } from './../networking/packets/incoming';
import { PlayerTextPacket } from './../networking/packets/outgoing';

@Library({
    name: 'Hello Plugin',
    author: 'tcrane'
})
class HelloPlugin {

    @PacketHook()
    onText(client: Client, textPacket: TextPacket): void {

        if (textPacket.recipient === client.playerData.name) {

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
gulp
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
@Library({
    name: 'Hello Plugin',
    author: 'tcrane'
})
class HelloPlugin {

    private response: string;

    @PacketHook()
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

Now we need to add an if statement to detect a new keyword to change the response message. However this time we also need to detect the command's argument, which is the new response message. A simple way to do this is to use regex.

Regex won't be explained in a lot of detail here, but [regexr.com](https://regexr.com/) is a great resource to learn and create regex.

We can use another variable to store the regex in case it ever needs to change.
```typescript
@Library({
    name: 'Hello Plugin',
    author: 'tcrane'
})
class HelloPlugin {

    private response: string;
    private setRegex = /^set\s+(\S+.*)$/;

    @PacketHook()
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
@PacketHook()
onText(client: Client, textPacket: TextPacket): void {

    if (textPacket.recipient === client.playerData.name) {
        const match = this.setRegex.exec(textPacket.text);
        if (match) {
            this.reponse = match[1];
            const reply = new PlayerTextPacket();
            reply.text = '/tell ' + textPacket.name + ' set response to ' + this.response;
            client.packetio.sendPacket(reply);
        }
        ...
    }
}
```
If the regex matches the text, the matched group of the regex will be `match[1]`.

There is one more thing to do before we can test the command. When the plugin starts, the variable `response` will be `null`. To give it a default value, we will use the `constructor`. This will only be called once when the plugin loads, so it should be used for initialisation of variables.
```typescript
@Library({
    name: 'Hello Plugin',
    author: 'tcrane'
})
class HelloPlugin {

    private response: string;
    private setRegex = /^set\s+(\S+.*)$/;

    constructor() {
        this.response = 'Default response';
    }

    @PacketHook()
    onText(client: Client, textPacket: TextPacket): void {
        ...
    }
}
```
Now that `reponse` has a default value, we can test the plugin.

To test the command, rebuild and run nrelay
```bash
gulp
```
```bash
nrelay
```

Now, use the regular RotMG client and a second account to send a /tell to the account logged in on nrelay. If you send the text `/tell <yourname> hello` You should now receive the reply `<yourname> Default response`

Now, if you send the bot `/tell <yourname> set New reposnse text` it should reply `<yourname> set response to New response text`

If you try the `hello` command again, it should now say `<yourname> New response text`

## The Logger class
If you need to print out some information for debugging or logging purposes, you should use the `Logger` class.
Normally, you could use something like
```typescript
console.log('Player name: ' + client.playerData.name);

// prints
//
// Player name: Eendi
//
```
Using the logger class instead of `console.log` allows you to take advantage of nrelay's logging mechanism.
Firstly, you need to import the `Logger` class exports
```typescript
import { Logger, LogLevel } from './../core';
```
`LogLevel` is an enum which describes the type of message you are trying to log. It consists of
```typescript
enum LogLevel {
  Debug,
  Info,
  Message,
  Warning,
  Error,
  Success,
}
```
The logger class has a `log` method which takes a sender, a message and a level parameter. The level parameter has a default value of `LogLevel.Message` so it can be excluded if you are using this level.
```typescript
Logger.log('MyPlugin', `Player name: ${client.playerData.name}`);

// prints
//
// [MyPlugin] Player name: Eendi
//
```
The log level can be used to describe the nature of your message. Loggers can use this additional information to change the way that the message is logged.

For example, the `DefaultLogger` will print any log message with a level of `LogLevel.Error` in red, and any message with a level of `Success` in green.

The [logging guide](logging-guide.md) provides more information about the logging mechanism, and includes a guide on how to create your own custom loggers, including a Discord logger.

## Plugin Interop
nrelay supports plugin interoperability through dependency injection. For larger or more complex plugins, it may be desirable to split the plugin up into multiple different 'modules' which have only a single responsibility. The plugin interop can be used to achieve such a design pattern.

To allow a class to be injected into others, the `export` keyword should be used when declaring the class.
```typescript
// this plugin can be accessed by other plugins.
@Library({ name: 'Component A', author: 'tcrane' })
export class MyPluginComponent {
    ...
}

// this plugin won't be exposed and is inaccessible by other plugins.
@Library({ name: 'Cool Plugin', author: 'tcrane' })
class CoolPlugin {
    ...
}
```

If you have a plugin component `ComponentA`
```typescript
@Library({ name: 'Component A', author: 'tcrane' })
export class ComponentA {
    public myString = 'Test String';
}
```
You can inject it into another plugin by simply declaring it as a constructor parameter of that plugin.
```typescript
import { PluginManager } from './../core';
import { ComponentA } from './component-a'; // the class needs to be imported to be used.

@Library({ name: 'Component A', author: 'tcrane' })
class PluginCore {

    constructor(componentA: ComponentA) {
        console.log('My string: ' + componentA.myString);
        // Prints:
        // My string: Test String
    }
}
```
If you need to use the injected plugin from other parts of the plugin, (e.g. packet hooks) you can use TypeScript constructor assignment to make the injected component a property of the plugin.
```typescript
@Library({ name: 'Component A', author: 'tcrane' })
class PluginCore {

    // The subtle difference here is the word 'private' before the name.
    constructor(private componentA: ComponentA) {
        console.log('My string: ' + this.componentA.myString);
        // Prints:
        // My string: Test String
    }

    @PacketHook()
    onSomePacket(...) {
        console.log(this.componentA.myString); // componentA is also accessible here.
    }
}
```

TypeScript constructor assignment sytnax is equivalent to
```typescript
class MyClass {
    private myProperty: MyType;
    
    constructor(myProperty: MyType) {
        this.myProperty = myProperty;
    }
}
```


## Plugin template
```typescript
import { Library, PacketHook, Client } from './../core';

import { UpdatePacket } from './../networking/packets/incoming';

@Library({
    name: 'Your Plugin Name',
    author: 'Your Name'
})
class YourPluginName {

    constructor() {

    }

    @PacketHook()
    onUpdate(client: Client, updatePacket: UpdatePacket): void {

    }
}
```
