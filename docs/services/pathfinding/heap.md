# Heap
An implementation of a generic min-heap.

This class is generic and requires a generic type `T` which implements the `IHeapItem<T>` interface.

### [Public members](#public-members)
 + [`count: number`](#count-number)
### [Public methods](#public-methods)
 + [`add(item: T): void`](#additem-t-void)
 + [`removeFirst(): T`](#removefirst-t)
 + [`update(item: T): void`](#updateitem-t-void)
 + [`contains(item: T): bolean`](#containsitem-t-boolean)

### Public members
#### `count: number`
Returns the current heap size.

### Public methods
#### `add(item: T): void`
Adds the `item` to the end of the heap and performs a sort up operation.

#### `removeFirst(): T`
Removes and returns the first item from the heap and replaces it with the last item then performs a sort down operation on that item.

#### `update(item: T): void`
Performs a sort up operation on the `item`.

#### `contains(item: T): boolean`
Checks whether or not `item` is in the heap. Returns true if the item does exist, otherwise false.
