# PlayerData
This class exports models and methods related to the `IPlayerData` interface.

### [Exported methods](#exported-methods)
 + [`getDefaultPlayerData(): IPlayerData`](#getdefaultplayerdata-iplayerdata)
### [Exported interfaces](#exported-interfaces)
 + [`IPlayerData`](#iplayerdata)


### Exported methods
#### `getDefaultPlayerData(): IPlayerData`
This returns an `IPlayerData` object with default values.

### Exported interfaces
#### `IPlayerData`
Holds information about players.
#### `objectId: number`
The object id of the player.

#### `worldPos: WorldPosData`
The player's position on the map.

#### `name: string`
The player's name.

#### `level: number`
The players's level.

#### `exp: number`
The player's XP points.

#### `currentFame: number`
The current character's fame.

#### `stars: number`
The number of stars the player has.

#### `accountId: string`
The account id of the player.

#### `accountFame: number`
The account fame of the player.

#### `nameChosen: boolean`
Whether or not the player has chosen a unique name.

#### `guildName: string`
The name of the guild which the player is in, or null if they are not in a guild.

#### `guildRank: GuildRank`
The number code of the player's guild rank. See the `GuildRank` enum for more info.

#### `gold: number`
The amount of gold the player has.

#### `class: Classes`
The character's class.

#### `maxHP: number`
The character's max hp.

#### `maxMP: number`
The character's max mp.

#### `hp: number`
The character's current hp

#### `mp: number`
The character's current mp

#### `atk: number`
The character's attack stat value.

#### `def: number`
The character's defense stat value.

#### `spd: number`
The character's speed stat value.

#### `dex: number`
The character's dexterity stat value.

#### `wis: number`
The character's wisdom stat value.

#### `vit: number`
The character's vitality stat value.

#### `hpPots: number`
The number of hp pots the character has.

#### `mpPots: number`
The number of mp pots the character has.

#### `hasBackpack: boolean`
Whether or not the character has a backpack.

#### `inventory: number[]`
The item ids of all items in the players inventory. This includes the first four equipment slots. If there is no item the value will be `-1`.

#### `server: string`
> **Deprecated** Use `Client.server` instead.

The current server of the client. If you are accessing this value on a client object, use `Client.server` instead. If you are accessing this value on the player data of another player, `server` will still contain the correct value.
