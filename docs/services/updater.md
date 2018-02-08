# Updater
This class contains the functionality for downloading the lastest `GroundTypes.json`, `Objects.json` and packet ids.

### [Public members](#public-members)
 + [`static latestVersion: string`](#static-latestversion-string)
### [Public methods](#public-methods)
 + [`static checkVersion(): Promise<boolean>`](#static-checkversion-promiseboolean)
 + [`static getLatest(): Promise<boolean>`](#static-getlatest-promiseboolean)

### Public members
#### `static latestVersion: string`
The latest version of the game. This is assigned to when `checkVersion` is called, so it may be overriden if assigned to.

### Public methods
#### `static checkVersion(): Promise<boolean>`
Gets the latest version string for the client. It returns a promise which will be rejected with an error if one occurs, or resolved with a boolean indicating whether an update is required. If the boolean is true, a new update is available.

#### `static getLatest(): Promise<boolean>`
Gets the latest `GroundTypes.json`, `Objects.json` and packet ids. The downloaded assets will be saved to the `resources/` folder and the `PacketType` enum.
