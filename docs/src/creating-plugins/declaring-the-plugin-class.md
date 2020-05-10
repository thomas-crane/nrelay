# Declaring the plugin class

Now that we have our project set up, we can start writing the Hello Plugin. Open up the `src/hello-plugin.ts` file in your editor of choice to get started.

The first step of creating a plugin is to import some types from nrelay in order to declare the plugin. We'll only be using `Library` straight away, but the others are so commonly used that we will import them now anyway.

```ts
import { Library, PacketHook, Client } from 'nrelay';
```

Now that we have the essentials imported, we can declare the plugin class.

```ts
import { Library, PacketHook, Client } from 'nrelay';

class HelloPlugin {

}
```

In order for nrelay to recognize this class as a plugin, it needs to be decorated using the `Library` decorator. The `Library` decorator requires an object parameter which is used to describe the plugin.

```ts
@Library({ name: 'Hello plugin', author: 'tcrane' })
class HelloPlugin {

}
```

A `description` can optionally be included to describe the plugin, and `enabled` can be used to tell nrelay whether or not to load the plugin. For example:

```ts
// this plugin will be loaded
@Library({
  name: 'Cool plugin',
  author: 'tcrane',
  description: 'A cool plugin'
  enabled: true,
})
class CoolPlugin {
  // ...
}

// this plugin won't be loaded
@Library({
  name: 'Another cool plugin',
  author: 'tcrane',
  enabled: false,
})
class UnusedPlugin {
  // ...
}
```

All plugins are enabled by default, so if `enabled` is not included, the plugin will still load anyway.

These are the bare essentials for a plugin. Let's verify that nrelay recognizes this plugin by building and running the project.

```bash
$ nrelay build
  ✔ Clean project
  ✔ Build project
$ nrelay run
[14:10:14 | Runtime]          Checking for updates...
# ...
[14:10:15 | LibraryManager]   Loading plugins...
[14:10:15 | LibraryManager]   Loading HelloPlugin...
[14:10:15 | LibraryManager]   Loaded Hello plugin by tcrane!
```

Success! We can see from the output that nrelay knows about our Hello Plugin. However, our bot still doesn't do anything. In the next chapter we'll learn about packet hooks, which we can use to start interacting with the game.
