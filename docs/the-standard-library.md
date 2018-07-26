# The Standard Library
nrelay has a "standard library" which consists of libraries that are not designed to be run on their own but instead used in other plugins to make development easier.
These libraries have well defined behaviour and it is recommended to use them wherever possible, instead of implementing your own version.

## Contents
+ [Using the standard libraries](#using-the-standard-libraries)
+ [Available libraries](#available-libraries)
  + [Player Tracker](#player-tracker)
  + [Object Tracker](#object-tracker)

## Using the standard libraries
Because of the dependency injection system, using a library in your plugin is an extremely simple process.

Firstly, you need to import the library you want to use from the `stdlib` module.
```typescript
import { PlayerTracker } from '../stdlib/player-tracker';
```
To allow the library to be used from your plugin, you can simply include it as a constructor argument.

```typescript
import { Library } from '../core';
import { PlayerTracker } from '../stdlib/player-tracker';

@Library({ name: 'Example plugin', author: 'tcrane' })
class ExamplePlugin {

    private playerTracker: PlayerTracker;

    constructor(tracker: PlayerTracker) {
      this.playerTracker = tracker;
    }
}
```

## Available libraries
This is a list of all libraries available in the `stdlib` module.

## Player Tracker
This library is designed to abstract the logic of tracking players and keeping their stats up to date,
as well as providing an event emitter for players entering and leaving the map.
```typescript
import { Library } from '../core';
import { PlayerTracker } from '../stdlib/player-tracker';

@Library({ name: 'Example plugin', author: 'tcrane' })
class ExamplePlugin {
    constructor(private playerTracker: PlayerTracker) { }
}
```
### API
The public methods available on the Player Tracker for plugins to use.

#### `on(event: string, listener: PlayerEventListener): EventEmitter`
Used to attach an event listener to the player tracker.

`PlayerEventListener` is a type which represents the method signature `(player: PlayerData, client: Client) => void`, where `player` is the player which the event is about, and `client` is the client which the event was triggered for.

Events which can be fired are:
+ `'enter'` - When a player enters the current map.
+ `'leave'` - When a player leaves the current map.

#### `getAllPlayers(): PlayerData[]`
Calling this method will return all players which are tracked. If there are no tracked players, this will return an empty array.

#### `getPlayersFor(client: Client): PlayerData[]`
Calling this method will return the tracked players that are visible to the `client`. For example, if you have two clients on two different servers, `getAllPlayers` will return players for **both** servers, whereas `getPlayersFor` will return the players for the server the `client` is on.

### Example usage:
This plugin prints the number of players visible to each client when a `NewTickPacket` is received.
```typescript
import { Library, PacketHook, Client, Logger } from '../core';
import { NewTickPacket } from '../networking';
import { PlayerTracker } from '../stdlib/player-tracker';

@Library({ name: 'Example plugin', author: 'tcrane' })
class ExamplePlugin {
  constructor(private playerTracker: PlayerTracker) { }

  @PacketHook()
  onNewTick(client: Client, newTick: NewTickPacket): void {
    const trackedPlayers = this.playerTracker.getPlayersFor(client);
    Logger.log('Plugin', `The client ${client.alias} can see ${trackedPlayers.length} players.`);
  }
}

```

## Object Tracker
This library is designed to provide an event based way of detecting when objects, such as dungeon portals, have entered the map.

Objects won't be detected unless tracking has been enabled for them. See the API section for info on how to enable tracking for certain objects.
```typescript
import { Library } from '../core';
import { ObjectTracker } from '../stdlib/object-tracker';

@Library({ name: 'Example plugin', author: 'tcrane' })
class ExamplePlugin {
    constructor(private objectTracker: ObjectTracker) { }
}
```
### API
The public methods available on the Object Tracker for plugins to use.

#### `on(event: number | 'any', listener: ObjectEventListener): this`
Used to attach an event listener to the object tracker.

`ObjectEventListener` is a type which represents the method signature `(obj: ObjectData, client: Client) => void`, where `obj` is the object which the event is about, and `client` is the client which the event was triggered for.

The `event` can be either:
+ A number, which should be the object type of an object. If an object that is being tracked is detected, the listener will be called.
+ `'any'`, which will call the listener if *any* of the tracked objects are detected.

Be aware that the `'any'` event, as the name suggests, is raised when *any* tracked object is detected. This may include objects that **other plugins** have enabled tracking for!

This method returns the Object Tracker that it was called on, so it can be used in a chained call.

#### `startTracking(objectType: number, listener?: ObjectEventListener): this`
Starts tracking objects with the provided `objectType`. If a `listener` is provided, it will be attached to the event which is raised when an object of `objectType` is detected. For example,
```typescript
tracker.startTracking(tombPortalObjectType, (obj) => {
  Logger.log('Dungeons', 'A tomb portal was opened');
});
```
is equivalent to:
```typescript
tracker.startTracking(tombPortalObjectType);
tracker.on(tombPortalObjectType, (obj) => {
  Logger.log('Dungeons', 'A tomb portal was opened');
});
```

This method returns the Object Tracker that it was called on, so it can be used in a chained call.

#### `stopTracking(objectType: number): this`
Stops tracking objects with the provided `objectType` and removes all event listeners which were attached to that object type.

This method returns the Object Tracker that it was called on, so it can be used in a chained call.

### Example usage:
This plugin logs a message when a dungeon that is being tracked has been opened.
```typescript
import { Library, PacketHook, Logger } from '../core';
import { ObjectTracker } from '../stdlib/object-tracker';

const TOMB_TYPE = 0x072c; // the tomb portal object type.
const HALLS_TYPE = 0xb024; // the lost halls portal object type.

// An object to convert the object types to the names.
const NAMES: { [type: number]: string } = {
  0x072c: 'Tomb of the Ancients',
  0xb024: 'Lost Halls'
};

@Library({ name: 'Example plugin', author: 'tcrane' })
class ExamplePlugin {
  constructor(private objectTracker: ObjectTracker) {
    objectTracker
      .startTracking(TOMB_TYPE)
      .startTracking(HALLS_TYPE)
      .on('any', (obj, client) => {
        const portalName = NAMES[obj.objectType];
        Logger.log('Dungeons', `A ${portalName} was opened in ${client.server.name}!`);
      });
  }
}

```
