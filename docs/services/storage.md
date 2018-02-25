# Storage
The `Storage` class provides a set of methods to store and retrieve JSON files.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static get(...filePath: string[]): Promise<any>`](#static-getfilepath-string-promiseany)
 + [`static readText(...filePath: string[]): Promise<string>`](#static-readtextfilepath-string-promisestring)
 + [`static writeText(data: string, ...filePath: string[]): Promise<any>`](#static-writetextdata-string-filepath-string-promiseany)
 + [`static makePath(...filePath: string[]): string`](#static-makepathfilepath-string-string)
 + [`static set(data: object, ...filePath: string[]): Promise<any>`](#static-setdata-object-filepath-string-promiseany)
 + [`static getAccountConfig(): IAccountInfo`](#static-getaccountconfig-iaccountinfo)
 + [`static createLog(): void`](#static-createlog-void)



### Public members
This class has no public members.

### Public methods
#### `static get(...filePath: string[]): Promise<any>`
This method will return a JSON object of the contents of the `filePath` array. The path should be relative to the root directory (`nrelay/`), e.g.
```typescript
Storage.get('dist', 'plugins', 'config.json').then((config) => {
    this.config = config;
}).catch((error) => {
    Log('Plugin', error, LogLevel.Error);
});
```

#### `static readText(...filePath: string[]): Promise<string>`
This method will return the plaintext contents of the specified file. The path should be relative to the root directory (`nrelay/`)

#### `static writeText(data: string, ...filePath: string[]): Promise<any>`
This method will write the `data` string to the file at the specified path. The path should be relative to the root directory (`nrelay/`)

#### `static makePath(...filePath: string[]): string`
Creates a path to a file. The path should be relative to the root directory (`nrelay/`), e.g.
```typescript
const configPath = Storage.makePath('dist', 'plugins', 'config.json');
```

#### `static set(data: object, ...filePath: string[]): Promise<any>`
This method will store a JSON object in the file path specified. The file path should be relative to the root directory (`nrelay/`).

#### `static getAccountConfig(): IAccountInfo`
Gets the account config file.

#### `static createLog(): void`
Creates a `WriteStream` object and assigns it to the `logStream` property.
