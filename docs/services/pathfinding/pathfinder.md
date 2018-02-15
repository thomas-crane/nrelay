# Pathfinder
A service class for providing AStar pathfinding.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`findPath(start: IPoint, end: IPoint): Promise<IPoint[]>`](#findpathstart-ipoint-end-ipoint-promiseipoint)
 + [`updateWalkableNodes(updates: INodeUpdate[]): void`](#updatewalkablenodesupdates-inodeupdat-void)

### Public members
This class has no public members.

### Public methods
#### `findPath(start: IPoint, end: IPoint): Promise<IPoint[]>`
Returns a promise which resolves when a path is found between the `start` and `end` points. The path is returned as a seqential array of `IPoints` which can be travelled to in order to reach the `end` point.
The promise will be rejected if no path is found.

#### `updateWalkableNodes(updates: INodeUpdate[]): void`
Updates the specified nodes in the pathfinder's graph.
