# HashSet
A hash set used to store items with unique hashes.

This class is generic and requires a generic type `T` which implements the `IHashable` interface.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`add(item: T): void`](#additem-t-void)
 + [`remove(item: T): void`](#removeitem-t-void)
 + [`contains(item: T): void`](#containsitem-t-boolean)

### Public members
This class has no public members.

### Public methods
#### `add(item: T): void`
Adds `item` to the hash set.

#### `remove(item: T): void`
Removes `item` from the hash set.

#### `contains(item: T): boolean`
Checks whether or not `item` exists in the hash set. Returns true if the item does exist, otherwise false.
