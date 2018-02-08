# NrPlugin
This decorator is used to declare a class as a plugin.

To use the decorator, first declare a class which will become the plugin.
```typescript
class MyPlugin {

}
```
Next, include the `NrPlugin` decorator to the class, and include an object with a `name`, `author`, optionally a `description` and an `enabled` flag.
```typescript
@NrPlugin({
    name: 'My Plugin',
    author: 'tcrane',
    enabled: true
})
class MyPlugin {

}
```
If the plugin needs to be exposed to the plugin manager in order to use it in other plugins, you should include the `export` keyword before the class
```typescript
@NrPlugin({
    name: 'My Plugin',
    author: 'tcrane',
    enabled: true
})
export class MyPlugin {

}
```
The exported class can be accessed using the `PluginManager.getInstanceOf(MyPlugin)` method, however if the `export` keyword is not present the `getInstanceOf` method will not work.
