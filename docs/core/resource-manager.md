# ResourceManager
The resource manager can be used to access information loaded from the `GroundTypes.json` and `Objects.json` files.

### [Public members](#public-members)
 + [`tiles: { [id: number]: ITile }`](#tiles--id-number-itile-)
 + [`objects: { [id: number]: IObject }`](#objects--id-number-iobject-)
 + [`items: { [id: number]: IObject }`](#items--id-number-iobject-)
 + [`enemies: { [id: number]: IObject }`](#enemies--id-number-iobject-)
 + [`pets: { [id: number]: IObject }`](#pets--id-number-iobject-)
### [Public methods](#public-methods)
 + [`static loadTileInfo(): Promise<void>`](#static-loadtileinfo-promisevoid)
 + [`static loadObjects(): Promise<void>`](#static-loadobjects-promisevoid)

### Public members
#### `tiles: { [id: number]: ITile }`
All tiles loaded from the `GroundTypes.json` file.

#### `objects: { [id: number]: IObject }`
All items loaded from the `Objects.json` file. This includes all objects in the other object dictionaries.

#### `items: { [id: number]: IObject }`
A subset of the `objects` dictionary which only includes items.

#### `enemies: { [id: number]: IObject }`
A subset of the `objects` dictionary which only includes enemies.

#### `pets: { [id: number]: IObject }`
A subset of the `objects` dictionary which only includes pets.

### Public methods
#### `static loadTileInfo(): Promise<void>`
Asynchronously loads the resources from the `GroundTypes.json` file. Returns a promise which resolves when the process has complete, and is rejected if the process failed.

#### `static loadObjects(): Promise<void>`
Asynchronously loads the resources from the `Objects.json` file. Returns a promise which resolves when the process has complete, and is rejected if the process failed.
