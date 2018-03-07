# CLI
The main class which runs the command line interface.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static addClient(account: IAccount, charInfo?: ICharacterInfo): Promise<any>`](#static-addclientaccount-iaccount-charinfo-icharacterinfo-promiseany)
 + [`static removeClient(alias: string): boolean`](#static-removeclientalias-string-boolean)
 + [`static getClient(alias: string): Client | null`](#static-getclientalias-string-client--null)
 + [`static getClients(): Client[]`](#static-getclients-client)
 + [`static loadServers(): Promise<any>`](#static-loadservers-promiseany)

### Public members
This class has no public members.

### Public methods
#### `static addClient(account: IAccount, charInfo?: ICharacterInfo): Promise<any>`
Adds the account to the list of bots and attempts to connect it. Returns a promise which resolves with a reference to the `Client` which was created for the new account.If there is an error the promise is rejected.

If the `charInfo` parameter is provided, _or_ if the `account.charInfo` field is not `null`, then the initial web request to retrieve the character info will be skipped and the client will be connected immediately. If the `charInfo` parameter is provided _and_ the `account.charInfo` is not `null`, the `charInfo` parameter will be preferred.

#### `static removeClient(alias: string): boolean`
Removes the client with the specified `alias`. Returns true if the client was removed or false if it wasn't.

#### `static getClient(alias: string): Client | null`
Returns a reference to the `Client` with the specified `alias`. Returns `null` if the client was not found.

#### `static getClients(): Client[]`
Returns an array of all connected clients.

#### `static loadServers(): Promise<any>`
Loads the list of servers. Returns a promise which resolves if the servers were loaded successfully. If there is an error retrieving the servers then the promise will be rejected.
