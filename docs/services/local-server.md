# LocalServer
This class provides a Local Server which supports TCP connections to enable communication between nrelay and other processes.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static init(port: number): void`](#static-initport-number-void)
 + [`static write(message: string | Buffer): void`](#static-writemessage-string-buffer-void)
 + [`static on(event: 'message', listener: (message: string) => void)`](#static-onevent-message-listener-message-string--void)

### Public members
This class has no public members.

### Public methods
#### `static init(port: number): void`
Initializes the local server and begins listening for connections on the `port` specified. This method is called by the `CLI` if the Local Server is enabled and should not be called manually.

#### `static write(message: string | Buffer): void`
Writes a message to all connected sockets. If `message` is a string, it will be converted to a buffer using `utf8` encoding.

All outgoing messages have a 4-byte header which indicates the length of the message. The header is written to the socket in Little-Endian order.

#### `static on(event: 'message', listener: (message: string) => void)`
Attaches an event listener to the Local Server. Currently the only available event is the `'message'` event which invokes the callbacks with the message received.
