# Interacting with clients

When a packet hook is called in nrelay, it can be useful to not only have the packet which was received, but also the client which received that packet. Having access to the client will let us solve the problem we left off with in the last chapter.

Luckily, getting access to the client is easy. We can simply add another parameter to the packet hook method!

```ts
class HelloPlugin {

  // add the client parameter.
  @PacketHook()
  onTextPacket(client: Client, textPacket: TextPacket) {

  }

}
```

By convention, the client parameter should be the first parameter in packet hook methods, but the order of the parameters doesn't actually matter.

Now, we can fix up the code that we wrote in the previous chapter. Instead of using a hardcoded name, we can access the client's `playerData` property, which in turn contains a `name` property.

```ts
if (textPacket.recipient === client.playerData.name) {
  // we got a pm!
}
```

If we refer back to the packet docs again, we can see that the `text` property of the text packet contains the actual message, so we can check whether or not the message was "hello".

```ts
if (textPacket.recipient === client.playerData.name) {
  if (textPacket.text === 'hello') {
    // we got a pm, and the message was 'hello'.
  }
}
```

Let's run our code again to make sure our logic is correct. We can add a console log to see whether or not our code has executed.

```ts
if (textPacket.text === 'hello') {
  console.log('%s said hello to us!', textPacket.name);
}
```

Since we have changed our code, we must remember to run the build command before running the project.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run
[21:21:52 | ResourceManager]  Loaded 1638 tiles.
# ...
[21:21:53 | Main Client]      Connecting to Nexus
[21:21:55 | Main Client]      Connected!
SomePlayer said hello to us!
```

If we go into the game and send hello to our bot, we can see that the event will be logged in the console. So far so good! We're not done with the hello plugin yet, though. The purpose of the plugin is to *reply* to someone when they say hello, so let's learn how to implement that in the next chapter.
