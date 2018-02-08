# XMLToJSON
This class provides methods for converting XML responses into JSON objects.

### [Exported methods](#exported-methods)
 + [`parseServers(xml: string): { [id: string]: IServer }`](#parseserversxml-string--id-string-iserver-)
 + [`parseAccountInfo(xml: string): ICharacterInfo | null`](#parseaccountinfoxml-string-icharacterinfo--null)
 + [`parseError(xml: string): string`](#parseerrorxml-string-string)

### Exported methods
#### `parseServers(xml: string): { [id: string]: IServer }`
Parses the server xml and returns a dictionary of `IServer` objects keyed by server name.

#### `parseAccountInfo(xml: string): ICharacterInfo | null`
Parses the account info xml and returns an `ICharacterInfo` object. If no match is found then `null` will be returned.

#### `parseError(xml: string): string`
Checks the `xml` string for the 5 Minute cooldown error.
