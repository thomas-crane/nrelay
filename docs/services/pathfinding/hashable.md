# Hashable
This class describes the `IHashable` interface.

### [Exported interfaces](#exported-interfaces)
 + [`IHashable`](#ihashable)

### Exported interfaces
#### `IHashable`
Indicates that the type which implements the interface can be used to generate a hash which is unique to that item.

#### `hash(): string`
A function which returns a string representation of the hash. The implementation of this method should return a string which is unique to the type which implements the interface, given the state of the instance which the method was called on.
