# HookPacket
This decorator is used to invoke a method when a packet is captured by a client.

To use the decorator, first declare a method to be invoked.
```typescript
onPacket(client: Client, packet: Packet): void {

}
```
Make sure the method signature is `Client, Packet`. Next, include the `HookPacket` decorator with the packet type you want to hook.
```typescript
@HookPacket(PacketType.UPDATE)
onPacket(client: Client, packet: Packet): void {

}
```
The decorated method will be invoked every time an `Update` packet is hooked. The `client` parameter will be the client which received the packet, and the `packet` parameter will be the packet itself. The `packet` parameter type can be any subtype of packet, such as `packet: UpdatePacket` for convenience.
