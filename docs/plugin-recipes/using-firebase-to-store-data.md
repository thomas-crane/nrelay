# Using Firebase to store data
This recipe will demonstrate how to use Firebase to store and retrieve data. To demonstrate this, the `Server Monitor` will be built. The aim of the plugin will be to monitor all of the players in a server.
[Firebase](https://firebase.google.com/) includes a realtime NoSQL database. NodeJS support is offered through an npm module which can be utilized by nrelay plugins to store data.

## Setup
Start by creating the file `server-monitor.plugin.ts` in the `src/plugins` folder. We can start with the plugin template provided in the `creating-plugins` doc. We can remove the `Update` packet hook since we don't need it.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core';

@NrPlugin({
    name: 'Server Monitor',
    author: 'tcrane',
    enabled: true
})
class ServerMonitor {

    constructor() {

    }

}

```

In order to use Firebase to store data in a plugin, you need to have a Firebase account. If you have an account set up, you can create a new project from the [Firebase console](https://console.firebase.google.com/).

Once you have the project set up, Go to the Project Overview, and click on `Add Firebase to your web app`. In the dialogue box, copy the `var config = { ... }` segment and put it in a `const` variable in the plugin.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core';

const firebaseConfig = {
    apiKey: 'your-apiKey',
    authDomain: 'your-authDomain',
    databaseURL: 'your-databaseURL',
    projectId: 'your-projectId',
    storageBucket: 'your-storageBucket',
    messagingSenderId: 'your-messagingSenderId'
};

@NrPlugin({ ...
```

Next, we need to install the `firebase` npm module in order to access the database. in the console, type the command
```bash
npm install firebase
```

Firebase can now be imported into the plugin.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core';
import * as firebase from 'firebase';
```

Now that firebase is imported, we can initialize the firebase app in the plugin constructor.
```typescript
class ServerMonitor {

    constructor() {
        firebase.initializeApp(firebaseConfig);
    }

}
```

Since we are monitoring players, we also need an instance of the `PlayerTracker` component.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, Log, LogLevel } from './../core';
import * as firebase from 'firebase';
import { PlayerTracker } from './player-tracker';

const firebaseConfig = { ... };
@NrPlugin({ ... })
class ServerMonitor {

    constructor() {
        const playerTracker = PluginManager.getInstanceOf(PlayerTracker);
        firebase.initializeApp(firebaseConfig);
    }

}
```
The `PluginManager.afterInit(...)` method should be used here to ensure the `PlayerTracker` instance has actually been created before we try to access it.

```typescript
class ServerMonitor {

    constructor() {
        PluginManager.afterInit(() => {
            const playerTracker = PluginManager.getInstanceOf(PlayerTracker);
            firebase.initializeApp(firebaseConfig);
        });
    }
}
```
Now that we have a reference to the player tracker component, we need to tell it to start tracking players for any client which enters the game. We can do this by subscribing to the `connect` event provided by the client.

```typescript
class ServerMonitor {

    constructor() {
        PluginManager.afterInit(() => {
            const playerTracker = PluginManager.getInstanceOf(PlayerTracker);
            Client.on('connect', (playerdata, client: Client) => {
                playerTracker.trackPlayersFor(client);
            });
            firebase.initializeApp(firebaseConfig);
        });
    }
}
```

We can also subcribe to the `enter` and `leave` events which the player tracker provides. These events will get fired every time new players enter or leave the map which the bot is on. To test that the bot is working so far, we can add some `console.log` statements to tell us when a player enter or leaves the current server. Running the bot now should fill the console with messages of players entering and leaving. If no messages are appearing, double check that the code you have written is the same as the code below.

```typescript
class ServerMonitor {

    constructor() {
        PluginManager.afterInit(() => {
            const playerTracker = PluginManager.getInstanceOf(PlayerTracker);
            Client.on('connect', (playerdata, client: Client) => {
                playerTracker.trackPlayersFor(client);
            });
            firebase.initializeApp(firebaseConfig);
            playerTracker.on('enter', (player) => {
                console.log(player.name + ' Entered the server.');
            });
            playerTracker.on('leave', (player) => {
                console.log(player.name + ' Left the server.');
            });
        });
    }
}
```

Now that we have data about players entering and leaving a server, we can start storing that information on Firebase. First, lets declare a reference to a location in the database. If you don't know much about Firebase or how it stores data, now would be a good time to look over the Firebase docs before continuing to write this plugin.

Because we are storing a list of data, we will make two new variables. The first variable will hold the root reference to the list, and the second one will be used to store the references to individual players in the list.
```typescript
class ServerMonitor {

    playerlistReference: firebase.database.Reference;
    playerRefs: {
        [name: string]: firebase.database.ThenableReference   
    };

    constructor() {
        ...
        firebase.initializeApp(config);
        this.playerlistReference = firebase.database().ref('players');
        this.playerRefs = {};
        ...
    }
}
```
The first variable is just a database reference, and is initialized to the path `players` in the database. A different path can be used, such as a path to a child node (e.g. `data/players`).
The second variable is a dictionary-like object which will be used to map player names to their reference in the database. Now that the necessary variable are declared, we can move on to actually storing data in the database.

When a new player enters the map (e.g. when the `enter` event fires) we want to do a few things:
 + Add the player's playerData to the database
 + Add the reference to that player in the database to the `playerRefs` dictionary.

The process is almost exactly the same for the `leave` event, except that we want to remove the player from both the database and the `playerRefs` dictionary.

We can create methods to perform the adding and removing. That way, the methods can be reused in other places if necessary. First lets create the `storePlayer` method to add a new player to the database.
```typescript
class ServerMonitor {
    ...
    storePlayer(player: IPlayerData): void {
        const reference = this.playerlistReference.push();
    }
}
```
The `this.playerlistReference.push()` method will add a new entry to the `players` list in the database and will return a `firebase.database.ThenableReference` which we can add to our dictionary of references. We first need to add the actual player data to the database which can be done using the `set` method on the reference.
```typescript
class ServerMonitor {
    ...
    storePlayer(player: IPlayerData): void {
        const reference = this.playerlistReference.push();
        reference.set(player).then(() => {

        }).catch((error) => {

        });
    }
}
```
The `set` method returns a promise, and we only want to add the reference to the dictionary if the operation was successful. If the data was successfully added, the `then` part will be called. If there was an error, the `catch` part will be called.

```typescript
class ServerMonitor {
    ...
    storePlayer(player: IPlayerData): void {
        const reference = this.playerlistReference.push();
        reference.set(player).then(() => {
            this.playerRefs[player.name] = reference;
        }).catch((error) => {
            Log('Server Monitor', 'Error while pushing playerdata: ' + error, LogLevel.Error);
        });
    }
}
```
Now that the store method is done, we can implement the `removePlayer` method. The first thing to do in the removePlayer method is check that the player exists in the dictionary.
```typescript
class ServerMonitor {
    ...
    removePlayer(player: IPlayerData): void {
        if (!this.playerRefs[player.name]) {
            return;
        }
    }
}
```
It may be beneficial to add a log message before the `return` to notify when the method was called but the player wasn't in the dictionary, as that behaviour is most likely unintended. 

To remove the player from the database, all we need to do is call `remove` on the reference. `remove` also returns a promise, however because we want to remove the player from the dictionary regardless of whether the remove operation was successful or not, we won't be using `then` or `catch` this time. The `remove` method takes an optional argument which is a method that has an optional `error` parameter.
```typescript
class ServerMonitor {
    ...
    removePlayer(player: IPlayerData): void {
        if (!this.playerRefs[player.name]) {
            return;
        }
        this.playerRefs[player.name].remove((error) => {

        });
    }
}
```
If an error occurred in the remove operation, the `error` parameter will be the error. Otherwise it will be `null`. To delete the player from the dictionary we can use the `delete` keyword. Although not necessary, it is still useful to log the error if one occurs, so we will add a log statement too.
```typescript
class ServerMonitor {
    ...
    removePlayer(player: IPlayerData): void {
        if (!this.playerRefs[player.name]) {
            return;
        }
        this.playerRefs[player.name].remove((error) => {
            if (error) {
                Log('Server Monitor', 'Error while removing playerdata: ' + error, LogLevel.Error);
            }
            delete this.playerRefs[player.name];
        });
    }
}
```

All that is left to do now is to call the methods we created in the player tracker event listeners.
```typescript
class ServerMonitor {

    constructor() {
        PluginManager.afterInit(() => {
            ...
            playerTracker.on('enter', (player) => {
                this.storePlayer(player);
            });
            playerTracker.on('leave', (player) => {
                this.removePlayer(player);
            });
        });
    }
}
```

The intended purpose of the plugin has now been fulfilled. When the bot connects to the server it will begin logging the `IPlayerData` of players entering the server and removing it when players leave. However, if you start the bot, the console will be filled with errors.
```
[14:27:19 | Server Monitor]   Error while pushing playerdata: Error: PERMISSION_DENIED: Permission denied
FIREBASE WARNING: set at /players/-L4xkBZpPUc6SDJPXPCd failed: permission_denied
FIREBASE WARNING: set at /players/-L4xkBZpPUc6SDJPXPCe failed: permission_denied
[14:27:19 | Server Monitor]   Error while pushing playerdata: Error: PERMISSION_DENIED: Permission denied
[14:27:19 | Server Monitor]   Error while pushing playerdata: Error: PERMISSION_DENIED: Permission denied
FIREBASE WARNING: set at /players/-L4xkBZpPUc6SDJPXPCf failed: permission_denied
[14:27:19 | Server Monitor]   Error while pushing playerdata: Error: PERMISSION_DENIED: Permission denied
FIREBASE WARNING: set at /players/-L4xkBZqSzTSzd3fEDwF failed: permission_denied
FIREBASE WARNING: set at /players/-L4xkBZqSzTSzd3fEDwG failed: permission_denied
```

These error occur because, by default, Firebase requires some kind of authentication to read/write to the database. For testing purposes, you can temporarily disable this requirement to test if the bot is working. In the Firebase console for your project, go to the `Database` page under the `DEVELOP` heading and click on the `Rules` tab. The default rules will look something like this:
```JSON
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
You can allow anyone to read or write to the database by changing the rules to 
```JSON
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
**These rules should never be used except for testing purposes!** Allowing unrestricted read/write (particularly write) access to your database is extremely dangerous. It is a much better option to set up an authentication method (such as email/password) and make an account for the bot which will be performing the logging.

Now that the rules allow reading and writing to the database, you can start the bot again. When the bot connects, you will start seeing items being added to and removed from the `players` tree in the database. Expanding one of the items in the list will reveal the player data for that player. This data can now be used in a web application or potentially by another nrelay bot.

Now that the plugin is finished, it should look like the following code. This plugin can be extended to log extra information, or log it in a different way such as on a per-server basis.
```typescript
import { NrPlugin, HookPacket, Packet, PacketType, Client, PluginManager, LogLevel, Log } from './../core';
import * as firebase from 'firebase';
import { PlayerTracker } from './player-tracker';
import { CLI } from '../cli';
import { IPlayerData } from '../models/playerdata';

const config = {
    apiKey: 'your-apiKey',
    authDomain: 'your-authDomain',
    databaseURL: 'your-databaseURL',
    projectId: 'your-projectId',
    storageBucket: 'your-storageBucket',
    messagingSenderId: 'your-messagingSenderId'
};

@NrPlugin({
    name: 'Server Monitor',
    author: 'tcrane',
    enabled: true
})
class ServerMonitor {

    playerlistReference: firebase.database.Reference;
    playerRefs: {
        [name: string]: firebase.database.ThenableReference
    };

    constructor() {
        PluginManager.afterInit(() => {
            const playerTracker = PluginManager.getInstanceOf(PlayerTracker);
            Client.on('connect', (playerdata, client: Client) => {
                playerTracker.trackPlayersFor(client);
            });
            firebase.initializeApp(config);
            this.playerlistReference = firebase.database().ref('players');
            this.playerRefs = {};
            playerTracker.on('enter', (player) => {
                this.storePlayer(player);
            });
            playerTracker.on('leave', (player) => {
                this.removePlayer(player);
            });
        });
    }

    storePlayer(player: IPlayerData): void {
        const reference = this.playerlistReference.push();
        reference.set(player).then(() => {
            this.playerRefs[player.name] = reference;
        }).catch((error) => {
            Log('Server Monitor', 'Error while pushing playerdata: ' + error, LogLevel.Error);
        });
    }

    removePlayer(player: IPlayerData): void {
        if (!this.playerRefs[player.name]) {
            return;
        }
        this.playerRefs[player.name].remove((error) => {
            if (error) {
                Log('Server Monitor', 'Error while removing playerdata: ' + error, LogLevel.Error);
            }
            delete this.playerRefs[player.name];
        });
    }

}

```
