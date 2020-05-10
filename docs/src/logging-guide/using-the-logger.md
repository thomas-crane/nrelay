# Using the logger

If we need to print out some information for debugging or logging purposes, we should use the `Logger` class.

Normally, we might use something like

```ts
console.log('Player name: ' + client.playerData.name);

// prints
//
// Player name: Eendi
//
```

This is fine, but using the logger class instead of `console.log` allows us to take advantage of nrelay's logging mechanism.

First, we need to import the `Logger` class and the `LogLevel` enum.

```ts
import { Logger, LogLevel } from 'nrelay';
```

The `LogLevel` enum provides a way for us to describe what kind of message we're logging, which affects how it is printed to the console.

```ts
enum LogLevel {
  Debug,
  Info,
  Message,
  Warning,
  Error,
  Success,
}
```

The logger class has a `log` method which takes a sender, a message and a level parameter. The level parameter has a default value of `LogLevel.Message` so it can be excluded if we are using this level.

```ts
Logger.log('MyPlugin', `Player name: ${client.playerData.name}`);

// prints
//
// [23:02:32 | MyPlugin]         Player name: Eendi
//
```

By default, the `Logger` will send all of it's messages to an instance of the `DefaultLogger` class, which is responsible for printing the messages in a fancy format.

We aren't stuck with the default logger though, so let's explore some of the internals of the logging mechanism in the next chapter.
