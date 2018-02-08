# Tile
This class describes the `ITile` interface.

### [Exported interfaces](#exported-interfaces)
 + [`ITile`](#itile)

### Exported interfaces
#### `ITile`
Represents a map tile.

#### `type: number`
The type of the tile. This corresponds to a value in the `ResourceManager.items` dictionary.

#### `id: string`
The name of the tile.

#### `sink: boolean`
Whether or not the player will sink on this tile.

#### `noWalk: boolean`
Whether or not the player can walk on this tile.
