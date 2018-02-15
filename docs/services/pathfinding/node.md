# Node
A graph node for use in an AStar algorithm.

This class implements `IHeapItem<Node>` and `IHashable`.

### [Public members](#public-members)
 + [`parent: Node`](#parent-node)
 + [`gCost: number`](#gcost-number)
 + [`hCost: number`](#hcost-number)
 + [`x: number`](#x-number)
 + [`y: number`](#y-number)
 + [`walkable: boolean`](#walkable-boolean)
 + [`heapIndex: number`](#heapindex-number)
 + [`fCost: number`](#fcost-number)
### [Public methods](#public-methods)
 + [`hash(): string`](#hash-string)
 + [`compareTo(item: Node): number`](#comparetoitem-node-number)

### Public members
#### `parent: Node`
The parent of this node or null when finding a path.

#### `gCost: number`
The distance of this node from the starting node when finding a path.

#### `hCost: number`
The distance of this node from the end node when finding a path.

#### `x: number`
The x coordinate of the node in game coordinates.

#### `y: number`
The y coordinate of the node in game coordinates.

#### `walkable: boolean`
Whether or not the player can walk on this node.

#### `heapIndex: number`
> Inherited from `IHeapItem<Node>`

The index of the item in the heap.

#### `fCost: number`
The sum of the `gCost` and the `hCost`.

### Public methods
#### `hash(): string`
> Inherited from `IHashable`

Returns a concatenation of the `x` and `y` properties.

#### `compareTo(item: Node): number`
> Inherited from `IHeapItem<T>`

Returns `-1` if the instance's `fCost` is higher than that of the `item`'s `fCost`. If the `fCost` is the same, then the `hCost` will be compared in the same manner. Otherwise returns `1`.

