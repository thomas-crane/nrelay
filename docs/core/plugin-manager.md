# PluginManager
The `PluginManager` class is used for all plugin detection, loading and interop.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static loadPlugins(): void`](#static-loadplugins-void)
 + [`addHook(packetType: PacketType, action: (caller: object, packet: Packet) => void, target: string): void`](#static-addhookpackettype-packettype-action-caller-object-packet-packet--void-target-string-void)
 + [`static addPlugin(info: IPluginInfo, target: new () => object): void`](#static-addplugininfo-iplugininfo-target-new---object-void)
 + [`static getInstanceOf<T extends object>(instance: new () => T): T | null`](#static-getinstanceoft-extends-objectinstance-new---t-t--null)
 + [`static afterInit(method: () => void): void`](#static-afterinitmethod---void-void)
 + [`static callHooks(packetType: PacketType, packet: Packet, client: object): void`](#static-callhookspackettype-packettype-packet-packet-client-object-void)

### Public members
This class has no public members.

### Public methods
#### `static loadPlugins(): void`
Loads the plugins in the `src/plugins folder`. This is called by the `CLI` and should not be called manually.

#### `static addHook(packetType: PacketType, action: (caller: object, packet: Packet) => void, target: string): void`
Adds a packet hook to which will be invoked when a packet of the specified type is received. Packet hook logic is handled in the `HookPacket` decorator, which should be used in most cases over using `addHook`.

#### `static addPlugin(info: IPluginInfo, target: new () => object): void`
Adds a plugin to the list of plugins which will be run. The `CLI` invokes this method on start up so there is no need to invoke it manually.

#### `static getInstanceOf<T extends object>(instance: new () => T): T | null`
Returns an instance of the type which is passed as the parameter. Example:
```typescript
import { MyPluginComponent } from './mycomponent';
...
const component = PluginManager.getInstanceOf(MyPluginComponent);
```

#### `static afterInit(method: () => void): void`
Registers a method to be invoked after all plugins have had their constructor called. This is where the `getInstanceOf` method should be used to ensure the plugin you are trying to get has been constructed.
Example:
```typescript
import { PluginManager } from './../core';
import { MyPluginComponent } from './mycomponent';
...
PluginManager.afterInit(() => {
    const component = PluginManager.getInstanceOf(MyPluginComponent);
});
```

#### `static callHooks(packetType: PacketType, packet: Packet, client: object): void`
Calls the packet hooks for the specified packet type. This will invoke all packet hooks registered for the `packetType` type and will pass the `client` as the argument to the packet hook. This should not be called manually.
