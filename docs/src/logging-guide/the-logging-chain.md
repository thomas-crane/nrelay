# The logging chain

nrelay uses a "logging chain" to allow multiple loggers to be used. The logging chain can be thought of as a linked list of loggers, where a log message is passed to each logger in the chain in the order that they were added to the chain.

For example, the two default loggers which nrelay uses are added to the chain during the start up process. These default loggers are the `DefaultLogger` (does the pretty console output), and the `FileLogger` (saves logs to a file).

## Modifying the logging chain

If we want to add a new logger to the logging chain, we can use the `Logger`'s `addLogger` method. This method takes an instance of a logger, and will append it to the end of the chain.

```ts
const anotherDefaultLogger = new DefaultLogger();
Logger.addLogger(anotherDefaultLogger);
```

We can also clear the logging chain by calling the `resetLoggers()` method.

```ts
Logger.resetLoggers();
// there are now no loggers in the logging chain.
```

If there are no loggers in the logging chain, we can still call the `log` method, but the log messages won't go anywhere. This can be utilised to create a "silent mode", where no logging will occur.

## Custom loggers

Simply adding *another* default logger to the logging chain is rather boring. In the next chapter, let's look at how we can create our own logger instead.
