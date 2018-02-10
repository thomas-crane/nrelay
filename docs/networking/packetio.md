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
This method will emit the `packet` to any clients subscribed to the `PacketIO` instance which emitted the packet. Usually the only client subscribed to a `PacketIO` is the client which owns that `PacketIO` instance. Because of this, calling `emitPacket` on a `PacketIO` owned by a client will emit the packet only to that client. To emit a packet to all clients instead, use `Client.broadcastPacket(packet: Packet): void`.

#### `destroy(): void`
This should only be used when the client is no longer required. This will remove all listeners and free any memory possible.
