# PacketIO
The `PacketIO` class is responsible for sending and receiving packets.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter`](#onevent-string--symbol-listener-args-any--void-eventemitter)
 + [`sendPacket(packet: Packet): void`](#sendpacketpacket-packet-void)
 + [`emitPacket(packet: Packet): void`](#emitpacketpacket-packet-void)
 + [`destroy(): void`](#destroy-void)

### Public members
This class has no public members.

### Public methods
#### `on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter`
Used to attach an event listener to the packetio.

Events which can be fired are:
 + `'packet'` - Fired when a packet is recieved.
 + `'error'`  - Fired when an error occurs.

#### `sendPacket(packet: Packet): void`
Used to send a packet. The `packet` argument can be any type which is a subclass of `Packet`. This includes all specific packet types such as `PlayerTextPacket` and `UpdateAckPacket`.

#### `emitPacket(packet: Packet): void`
Used to emit a packet to all clients. This is the same method which is used to send packets received from the game server, so any packet sent using this method will act the same as a packet received from the server.

#### `destroy(): void`
This should only be used when the client is no longer required. This will remove all listeners and free any memory possible.
