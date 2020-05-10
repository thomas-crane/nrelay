# Adding more functionality

Over the last few chapters we reimplemented the hello plugin that is included with nrelay. It's a good example of the basic structure of a plugin, but is frankly quite boring!

## The plan

Let's make it a bit more interesting by adding a new feature, the ability to change the response that the bot will use when it receives a PM.

Our plugin class may seem a bit "magic" because nrelay takes care of the glue between our plugin's code and the game itself. But our plugin class is really just a plain old JavaScript class!

Because of this, we can treat it like we would any other class, so we'll add a new private member to it in order to store our response.

```ts
@Library({ name: 'Hello plugin', author: 'tcrane' })
class HelloPlugin {

  /**
   * The response that our bot will give to a private message.
   */
  private response: string;

  @PacketHook()
  onTextPacket(client: Client, textPacket: TextPacket) {
    // -- snip --
  }

}
```

We'll also add a constructor to our class to give the `response` member a default value.

```ts
class HelloPlugin {
  // -- snip --

  constructor() {
    this.response = 'Hello!';
  }

  // -- snip --
}
```

In order to use this response, we'll have to modify our text packet hook method a bit.

```ts
if (textPacket.text === 'hello') {
  const reply = new PlayerTextPacket();

  // change this line to use the response member
  reply.text = `/tell ${textPacket.name} ${this.response}`;

  client.io.send(reply);
}
```

At this point we should be able to build our project and run our bot, and it should behave in the exact same way as it did before. We could also change what we initialise `response` to, and we should see the bot use that new response if we build and run the project again.

But this is not what we want! Changing the code and rebuilding the project every time we want a new response is frustrating, so let's implement a mechanism for changing the response while the bot is still running.

## Adding a "command"

What we would like to do is to have the ability to send the bot a message such as `"say Hello, World!"` and have the `response` update to be `"Hello, World!"`. To do this, we'll check for the usage of a "command".

To check for the command, we can add a new if statement to our text packet hook method that checks if the PM starts with the word `"say"`.

```ts
class HelloPlugin {

  // -- snip --

  @PacketHook()
  onTextPacket(client: Client, textPacket: TextPacket) {
    if (textPacket.recipient === client.playerData.name) {
      if (textPacket.text.startsWith('say')) {
        // this message is a command.
      }
      // -- snip --
    }
  }

}
```

To get the new response that we want to use from the message, we can use the `substring` command to cut off the `"say "` part of the message.

```ts
if (textPacket.text.startsWith('say')) {
  this.response = textPacket.text.substring(4);
}
```

**Note:** This method is very far from perfect! It doesn't bother to handle cases where there is no new response given after the command (e.g. just sending "say" to the bot). A better solution may be to use regex to check for the command and its required argument.

While we're at it, let's also add a console log so we know whether or not the command is working.

```ts
if (textPacket.text.startsWith('say')) {
  this.response = textPacket.text.substring(4);
  console.log('The response was changed to "%s"', this.response);
}
```

## Testing the changes


Now that we've implemented this new feature, we can give it a test. Rebuild the project and run it again.

At first, it should behave in exactly the same way as before. However, let's see what happens if we send the message `"say Hello, World!"` to our bot.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run --no-update
[23:01:23 | ResourceManager]  Loaded 1638 tiles.
# ...
[23:01:25 | Main Client]      Connected!
The response was changed to "Hello, World!"
```

Success! If we send our bot "hello" again, we can see that it now uses the new message we gave it.

## The next step

So far we've been using `console.log` whenever we need to print stuff to the console. This is quick, and works, but it's not very fancy. In the [logging guide](../logging-guide/using-the-logger.md), we'll go over how to use nrelay's logging system to get fancy looking output, and other functionality such as writing logs to a file.
