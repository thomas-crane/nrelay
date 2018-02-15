# Http
A service class for providing HTTP request functionality.

### [Public members](#public-members)
 + This class has no public members.
### [Public methods](#public-methods)
 + [`static get(path: string, query?: { [id: string]: string }): Promise<any>`](#static-getpath-string-query--id-string-string--promiseany)
 + [`static proxiedGet(path: string, proxy: IProxy, query?: { [id: string]: string }): Promise<any>`](#static-proxiedgetpath-string-proxy-iproxy-query--id-string-string--promiseany)
 + [`static post(path: string, query?: { [id: string]: string }): Promise<any>`](#static-postpath-string-params--id-string-any--promiseany)

### Public members
This class has no public members.

### Public methods
#### `static get(path: string, query?: { [id: string]: string }): Promise<any>`
This method performs an HTTP `GET` request. The `query` parameter is optional. If `query` is provided, the object will be turned into the query params for the web request. The returned promise will resolve with the response or be rejected if there is an error.

#### `static proxiedGet(path: string, proxy: IProxy, query?: { [id: string]: string }): Promise<any>`
The same as `get(...)` but will perform the request through the proxy specified in the `proxy` parameter.

#### `static post(path: string, params?: { [id: string]: any }): Promise<any>`
Performs an HTTP `POST` request, optionally with the specified query `params`. The returned promise will resolve with the response or be reject if there is an error.
