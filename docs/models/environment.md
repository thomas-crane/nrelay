# Environment
The environment class controls the nrelay environment variables. These variables can change the way nrelay runs.

### [Exported constants](#exported-constants)
 + [environment: Object](#environment-object)

### Exported constants
#### `environment: Object`
The environment object has two booleans:
```typescript
const environment = {
    debug: false,
    log: true
};
```
If the debug value is true, verbose logging will be enabled. If the log value is false, nrelay will not save the output to `nrelay-log.log`.
