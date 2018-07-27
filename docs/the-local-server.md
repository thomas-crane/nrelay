# The Local Server

## Contents
+ [Overview](#overview)
+ [Sending data to the Local Server](#sending-data-to-the-local-server)
  + [Node.js example](#nodejs-example)
+ [Receiving data from the Local Server](#receiving-data-from-the-local-server)
+ [Sending data from a plugin](#sending-data-from-a-plugin)
+ [Receiving data in a plugin](#receiving-data-in-a-plugin)
+ [Sending data to KRelay](#sending-data-to-krelay)

## Overview
nrelay provides the option to enable a local server which supports TCP connections. The server can be used to communicate between nrelay and another process such as KRelay. The server is disabled by default, but can be enabled by adding a property to the account config.
```json
{
    "buildVersion": "X25.1.1",
    "localServer": {
        "enabled": true
    },
    "accounts": [

    ]
}
```
By default, the server will use the port `5680`, but this can be changed by adding a `port` property to the account config.
```json
"localServer": {
    "enabled": true,
    "port": 9000
}
```

The local server can also be enabled programmatically by calling `LocalServer.init()` which optionally takes a `port` parameter.
If the local server was already initialized, a warning will be printed.

## Sending data to the Local Server
After you have connected to the local server, you can send data to it by simply writing data to the socket. nrelay will convert any received data to a UTF8 encoded string.

The "protocol" used here is deliberately simple. There are many different use cases for the local server, and the protocol that should be used to understand incoming data may be different for each use case. For this reason, *there is no incoming data protocol*. This allows a custom one to be implemented by plugins.

For example, a plugin may implement logic to read the first 5 characters of an incoming string as the zero-padded message length, and then read the specified number of characters before interpreting the message.

A much simpler protocol could be to read incoming data until a delimiter character is reached (such as a `|`) before interpreting the message.

### Node.js example
This example does not implement any kind of protocol for sending data.
```javascript
const net = require('net');

var socket = net.createConnection(5680, 'localhost', () => {
    console.log('Connected to nrelay server!');
    socket.write('Hello, nrelay!');
});
```

A slightly better protocol might send the length of the message as a zero-padded 5 letter string before actually sending the message.
```javascript
const net = require('net');

var socket = net.createConnection(5680, 'localhost', () => {
    console.log('Connected to nrelay server!');
    const message = 'Hello, nrelay!';
    const lengthString = message.length.toString();
    const len = '0'.repeat(5 - lengthString.length) + lengthString;
    socket.write(`${len}${message}`);
});
```
If this protocol is implemented, a plugin listening to the local server would need to implement a method to understand this protocol.

## Receiving data from the Local Server
Data which is sent from plugins will be sent to all connected sockets, and follows a very basic and easy to understand protocol. Any message which is sent from the server will have two parts to it: the header, and the payload.

The header is simply a block of 4 bytes which denotes the length of the payload. These 4 bytes represent an Int32, and are encoded in Little-Endian format.
For example, the header
```
04 00 00 00
```
Which is represented here by hex encoded bytes, indicates that the payload has a length of 4.

The payload section of the message is simply a UTF8 encoded string.
For example, the outgoing message `'test'` would be sent as follows:
```
| Header    | Payload   |
 04 00 00 00 74 65 73 74
|          4| t  e  s  t|
```

## Sending data from a plugin
Because the outgoing message protocol is already implemented by nrelay, sending data from a plugin is extremely simple.

First, the local server needs to be imported
```typescript
import { LocalServer } from '../services';
```
Data can be sent by simply calling `LocalServer.write` and passing the message you want to send.
```typescript
LocalServer.write('Hello from MyPlugin');
```
The method accepts either a string or a `Buffer`. If a buffer is passed, the contents of the buffer will be converted to a UTF8 encoded string before being written to the local server.

## Receiving data in a plugin
Receiving data in a plugin is also extremely simple, but it is recommended to implement some form of incoming message protocol which is also followed by the process sending the data.

The local server has an event emitter which emits a `'message'` event when data is received. For example,
```typescript
LocalServer.on('message', (message) => {
  console.log(`Received: ${message}`);
});
```
All messages which are received are converted to a UTF8 encoded string before being emitted in the message event.

A naive implementation of the aforementioned zero-padded length protocol might be similar to the following code
```typescript
let currentLength: number;
let messageBuffer = '';
LocalServer.on('message', (message) => {
  // if there is no current length, read one
  if (currentLength === undefined) {
    const length = +message.slice(0, 5); // get the first 5 characters as a number.
    // make sure it is a number
    if (isNaN(length)) {
      throw new Error('Length was not a number!');
    }
    currentLength = length;
  } else {
    // determine how many bytes are left to fill the message buffer.
    const bytesLeft = currentLength - messageBuffer.length;
    // if the incoming message is less than or equal
    // to the number we need, take the whole message.
    if (message.length <= bytesLeft) {
      messageBuffer += message;
    } else {
      // otherwise just take what we need.
      messageBuffer += message.slice(0, bytesLeft);
    }
    if (messageBuffer.length === currentLength) {
      // A message is ready!
      // Interpret the message and reset the buffer.
      console.log(`Full message received: ${messageBuffer}`);
      messageBuffer = '';
      currentLength = undefined;
    }
  }
});

```
This implementation is not perfect, and does not account for all possible situations, such as the receiving *half* of the next message's length at the end of the current message.

Nonetheless it is a good example of how an incoming protocol can be implemented in a relatively small amount of code.

## Sending data to KRelay
A very common use case for the local server is sending data to KRelay. Because this is so common, a library has already been written which implements the nrelay local server protocol.

The library can be found on [this GitHub repo](https://github.com/thomas-crane/NRelayLib). The readme includes an example of how to include the library in a KRelay plugin.
