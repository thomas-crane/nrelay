# Creating a custom logger

In this chapter, we'll implement the `BasicLogger`. A very simple logger with an interesting twist.

To start, let's create a new file under the source directory in our project called `basic-logger.ts`.

As usual, the first thing to do is to add some imports.

```ts
import { LogProvider, LogLevel } from 'nrelay';
```

We've already seen `LogLevel` and it won't be used until later, but `LogProvider` is new. `LogProvider` is an interface which describes the methods that a logger must have in order to be a valid logger.

Next, let's declare our logger class and implement the `LogProvider` interface.

```ts
class BasicLogger implements LogProvider {

}
```

If we tried to build our project now, we'd get an error saying that `BasicLogger` does not correctly implement the `LogProvider` interface. This is because we haven't added a `log` method to our class yet. Let's fix that now.

```ts
class BasicLogger implements LogProvider {
  log(sender: string, message: string, level: LogLevel): void {

  }
}
```

The log level needs to have these parameters (although you can change their names if you wish) since that's what the `LogProvider` interface tells us we must do.

Since this *is* a basic logger after all, let's make it live up to its name by adding some basic logging.

```ts
class BasicLogger implements LogProvider {
  log(sender: string, message: string, level: LogLevel): void {
    console.log(`[${sender}] ${message}`);
  }
}
```

At this point, our basic logger is done! If we want to test it we can import the `Logger` and replace the logging chain with our basic logger.

```ts
import { LogProvider, LogLevel, Logger } from 'nrelay';

class BasicLogger implements LogProvider {
  // -- snip --
}

const basicLogger = new BasicLogger();
Logger.resetLoggers();
Logger.addLogger(basicLogger);
```

If we build and run our project now, we'll notice some strange behaviour.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run --no-update
[23:45:11 | ResourceManager]  Loaded 1638 tiles.
[23:45:12 | ResourceManager]  Loaded 14206 objects.
[23:45:12 | Runtime]          Mapped 99 packet ids.
[23:45:12 | Runtime]          Using build version "X33.1.0"
[23:45:12 | Runtime]          Using client token "XTeP7hERdchV5jrBZEYNebAqDPU6tKU6"
[23:45:12 | LibraryManager]   Loading plugins...
[LibraryManager] Loading HelloPlugin...
[LibraryManager] Loaded Hello plugin by tcrane!
[Runtime] Loading Main Client...
[AccountService] Loading server list...
[AccountService] Cached server list loaded!
# ...
```

Our custom logger only kicks in once the plugins start being loaded!

This is an unfortunate problem with the way loggers are loaded in nrelay, and will be fixed eventually. For now, it is just an issue to be aware of.

## The twist

To add an interesting twist to our basic logger, let's make use of the log level which we previously ignored.

This twist takes advantage of the fact that the `LogLevel` enum simply represents a finite set of numbers, and in fact we can use a number where a `LogLevel` is expected!

```ts
Logger.log('MyPlugin', 'Hello, World!', 3); // this code compiles!
```

This will seem strange to those coming to TypeScript from a more strongly typed language, and familiar to those coming from a more weakly typed language. Either way, we can use it to implement a neat trick in our basic logger.

We can extend the possible set of log levels by simply reserving our own set of numbers. The `LogLevel` enum uses the numbers `0` through to `5` so we'll avoid those, and since we are just defining a single new log level we'll use a `const` instead of a new `enum`.

```ts
import { LogProvider, LogLevel, Logger } from 'nrelay';

/**
 * The log level for a really important log!
 */
export const ReallyImportantMessage = 999;
// -- snip --
```

Since we may want to make use of this log level in our plugins, we'll elso `export` it.

Let's also modify our logger to treat this log level differently from the rest.

```ts
// -- snip --
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

Let's test our new log level out by adding a quick log at the end of the file.

```ts
// -- snip --
Logger.addLogger(basicLogger);

Logger.log('Test', 'Stay home - save lives', ReallyImportantMessage);
```

Now when we build and run our project, we can see a log message that stands out a bit more than the rest.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run --no-update
[23:55:54 | ResourceManager]  Loaded 1638 tiles.
[23:55:54 | ResourceManager]  Loaded 14206 objects.
[23:55:54 | Runtime]          Mapped 99 packet ids.
[23:55:54 | Runtime]          Using build version "X33.1.0"
[23:55:54 | Runtime]          Using client token "XTeP7hERdchV5jrBZEYNebAqDPU6tKU6"
[23:55:54 | LibraryManager]   Loading plugins...
!!!!!!!!!!!!!
! [Test] Stay home - save lives!
!!!!!!!!!!!!!
[LibraryManager] Loading HelloPlugin...
[LibraryManager] Loaded Hello plugin by tcrane!
# ...
```

With this feature done, we've now got our own basic logger with a nice little twist built in.

## The complete code

Our code should now look similar to the following:

```ts
import { LogProvider, LogLevel, Logger } from 'nrelay';

/**
 * The log level for a really important log!
 */
export const ReallyImportantMessage = 999;

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

const logger = new BasicLogger();
Logger.resetLoggers();
Logger.addLogger(logger);

Logger.log('Test', 'Stay home - save lives', ReallyImportantMessage);
```

## The next step

The basic logger is a fun little example, but is not very useful. For a slightly more realistic use case for implementing your own logger, read on to the next chapter where we'll implement a logger that sends messages to Discord.
