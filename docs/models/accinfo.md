# AccInfo
This file exports several interfaces which are used to represent account and character info.

### [Exported interfaces](#exported-interfaces)
 + [`IAccountInfo`](#iaccountinfo)
 + [`IAccount`](#iaccount)
 + [`ICharacterInfo`](#icharacterinfo)
 + [`ILocalServerSettings`](#ilocalserversettings)


### Exported interfaces
### `IAccountInfo`
Represents the contents of the `acc-info.json` file.

#### `buildVersion: string`
The current build version of the game.

#### `accounts: IAccount[]`
An array of all accounts to load when nrelay starts.

### `IAccount`
Represents an account object in the `acc-info.json` file.

#### `alias: string`
What the client will appear as in the console. If this is null then it will be set to a censored version of the `guid`.

#### `guid: string`
The email address of the account.

#### `password: string`
The password of the account.

#### `serverPref: string`
The server to connect the bot to. This has to exactly match a server, e.g. `AsiaSouthEast` instead of `ASE`.

#### `charInfo: ICharacterInfo`
> This parameter is optional. Not including it will default it to null.

This is populated when the request to `/char/list` is made, so it will get overriden when the client makes a successful request.

#### `proxy: IProxy`
> This parameter is optional. Not including it will default it to null.

If this is included then the bot will connect through the provided proxy settings.

### `ICharacterInfo`
The character info of the account. This should not be modified as it is retreived from a web request when authenticating the account.

#### `charId: number`
The character id of the last played character.

#### `nextCharId: number`
The character id of the next character to be created.

#### `maxNumChars: number`
The maximum number of characters allowed on the account.

### `ILocalServerSettings`
#### `enabled: boolean`
Whether or not the Local Server is enabled.

#### `port: number`
> This parameter is optional. Not including it will default it to `5680`.

The port to listen for connections on.
