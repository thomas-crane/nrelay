# RC4
The RC4 class is used to cipher the incoming/outgoing traffic and maintain a cipher state.


### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`constructor(key: Buffer): RC4`](#constructorkey-buffer-rc4)
### [Exported constants](#exported-constants)
 + [OUTGOING_KEY: string](#outgoing_key-string)
 + [INCOMING_KEY: string](#incoming_key-string)

### Public members
This class has no public members.

### Public methods
#### `constructor(key: Buffer): RC4`
Constructs a new `RC4` instance with the specified key.
Example:
```typescript
const outgoingCipher = new RC4(OUTGOING_KEY);
```

#### `cipher(data: Buffer): void`
Performs an inline cipher on the `data` buffer.
Example:
```typescript
const packet: Packet = getPacketSomehow();
outgoingCipher.cipher(packet.data);
sendPacketSomehow(packet);
```

#### `reset(): void`
Resets the state of the cipher. This is called automatically by the client when it connects to a new host.

### Exported constants
#### `OUTGOING_KEY: string`
> Equal to `'311f80691451c71d09a13a2a6e'`

This is the RC4 key used for outgoing network trafic.

#### `INCOMING_KEY: string`
> Equal to `'72c5583cafb6818995cdd74b80'`

This is the RC4 key used for outgoing network trafic.
