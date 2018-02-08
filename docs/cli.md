# CLI
The main class which runs the command line interface.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static addClient(account: IAccount): Promise<any>`](#static-addclientaccount-iaccount-promiseany)
 + [`static removeClient(alias: string): boolean`](#static-removeclientalias-string-boolean)
 + [`static getClient(alias: string): Client | null`](#static-getclientalias-string-client--null)
 + [`static getClients(): Client[]`](#static-getclients-client)

### Public members
This class has no public members.

### Public methods
#### `static addClient(account: IAccount): Promise<any>`
Adds the account to the list of bots and attempts to connect it. Returns a promise which resolves with a reference to the `Client` which was created for the new account. If there is an error the promise is rejected.

#### `static removeClient(alias: string): boolean`
Removes the client with the specified `alias`. Returns true if the client was removed or false if it wasn't.

#### `static getClient(alias: string): Client | null`
Returns a reference to the `Client` with the specified `alias`. Returns `null` if the client was not found.

#### `static getClients(): Client[]`
Returns an array of all connected clients.
