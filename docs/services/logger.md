# Logger
This class exports several methods to provide a logging service to plugins.

### [Public members](#public-members)
 + [`static logStream: WriteStream`](#static-logstream-writestream)
### [Public methods](#public-methods)
 + This class has no public methods.
### [Exported methods](#exported-methods)
 + [`Log(sender: string, message: string, level: LogLevel): void`](#logsender-string-message-string-level-loglevel-void)
### [Exported enums](#exported-enums)

### Public members
#### `static logStream: WriteStream`
This is the `WriteStream` that the `Logger` will write messages to. If you want to provide a custom `WriteStream`, it should be set in a `PluginManager.afterInit()` call.

### Public methods
This class has no public methods.

### Exported methods
#### `Log(sender: string, message: string, level: LogLevel): void`
Logs a message to the console and the `logStream`. The message will be prepended with the current time, followed by the `sender` then the `message`. The color of the message is determined by the `level: LogLevel` parameter. The `level` parameter does not need to be included and will default to `LogLevel.Message`.

### Exported enums
#### `LogLevel`
The `LogLevel` enum determines the color of a log message when using the `Log` method.
```typescript
enum LogLevel {
    Info,    // gray
    Message, // white
    Warning, // yellow
    Error,   // red
    Success, // green
}
```
