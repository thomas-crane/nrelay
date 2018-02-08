# Proxy
This class describes the proxy interface.

### [Exported interfaces](#exported-interfaces)
 + [`IProxy`](#iproxy)

### Exported interfaces
#### `IProxy`
This describes the proxy the client will connect to.

#### `host: string`
The host ip of the proxy.

#### `port: number`
The port of the proxy.

#### `userId: string`
> This is optional. It will default to `null`.

The user id (if applicable) of the proxy.

#### `password: string`
> This is optional. It will default to `null`.

The password (if applicable) of the proxy.

#### `type: 4 | 5`
The type of the proxy. Use `4` for SOCKSv4 and SOCKSv4a. Use `5` for SOCKSv5 proxies.
