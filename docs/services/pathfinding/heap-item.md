# HeapItem
This class describes the `IHeapItem` interface.

This interface is generic and requires a generic type `T`.

### [Exported interfaces](#exported-interfaces)
 + [`IHeapItem`](#IHeapItem)

### Exported interfaces
#### `IHeapItem`
Indicates that the type which implements the interface can be stored in a heap structure.

#### `heapIndex: number`
The index of the item in the heap.

#### `compareTo(item: T): number`
A function which compares the instance which the method was called on to the `item` parameter. If the instance should come before the `item` in the heap, then it should return `< 0`. If the instance comes after the `item` in the heap, then it should return `> 0`. If the items have the same precedence in the heap, it should return `0`. This should be reversed if the items are intended to be used in a min-heap.
