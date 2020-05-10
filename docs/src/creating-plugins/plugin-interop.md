# Plugin interop

nrelay supports plugin interoperability through dependency injection. For larger or more complex plugins, it may be desirable to split the plugin up into multiple different 'modules' which have only a single responsibility. The plugin interop can be used to achieve such a design pattern.

To allow a class to be injected into others, the `export` keyword should be used when declaring the class.

```ts
// this plugin can be accessed by other plugins.
@Library({ name: 'Component A', author: 'tcrane' })
export class MyPluginComponent {
  ...
}

// this plugin won't be exposed and is inaccessible by other plugins.
@Library({ name: 'Cool Plugin', author: 'tcrane' })
class CoolPlugin {
  ...
}
```

If you have a plugin component `ComponentA`

```ts
@Library({ name: 'Component A', author: 'tcrane' })
export class ComponentA {
  public myString = 'Test String';
}
```

You can inject it into another plugin by simply declaring it as a constructor parameter of that plugin.

```ts
import { ComponentA } from './component-a'; // the class needs to be imported to be used.

@Library({ name: 'Plugin Core', author: 'tcrane' })
class PluginCore {

  constructor(componentA: ComponentA) {
    console.log('My string: ' + componentA.myString);
    // Prints:
    // My string: Test String
  }
}
```

If you need to use the injected plugin from other parts of the plugin, (e.g. packet hooks) you can use TypeScript constructor assignment to make the injected component a property of the plugin.

```ts
@Library({ name: 'Plugin Core', author: 'tcrane' })
class PluginCore {

  // The subtle difference here is the word 'private' before the name.
  constructor(private componentA: ComponentA) {
    console.log('My string: ' + this.componentA.myString);
    // Prints:
    // My string: Test String
  }

  @PacketHook()
  onSomePacket(/* ... */) {
    console.log(this.componentA.myString); // componentA is also accessible here.
  }
}
```

TypeScript constructor assignment syntax is equivalent to

```ts
class MyClass {
  private myProperty: MyType;

  constructor(myProperty: MyType) {
    this.myProperty = myProperty;
  }
}
```
