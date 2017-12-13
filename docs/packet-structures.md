# Packet Structures
This document outlines the structure of all packets which are available. All structures in this document are subclasses of the `Packet` class. Documentation for the `Packet` class is in the `object-structures` document.

## Table of Contents
### Incoming
 + [Arena](#arena)
    + [Arena Death](#arenadeath)
    + [Imminent Arena Wave](#imminentarenawave)
 + [Pets](#pets)
    + [Delete Pet Message](#deletepetmessage)
    + [Evolved Pet Message](#evolvedpetmessage)
    + [Hatch Pet Message](#hatchpetmessage)
 + [Account List Packet](#accountlistpacket)
 + [Aoe Packet](#aoepacket)
 + [Create Success Packet](#createsuccesspacket)
 + [Enemy Shoot Packet](#enemyshootpacket)
 + [Failure Packet](#failurepacket)
 + [Goto Packet](#gotopacket)
 + [Map Info Packet](#mapinfopacket)
 + [New Tick Packet](#newtickpacket)
 + [Ping Packet](#pingpacket)
 + [Reconnect Packet](#reconnectpacket)
 + [Server Player Shoot Packet](#serverplayershootpacket)
 + [Text Packet](#textpacket)
 + [Trade Accepted Packet](#tradeacceptedpacket)
 + [Trade Changed Packet](#tradechangedpacket)
 + [Trade Done Packet](#tradedonepacket)
 + [Trade Requested Packet](#traderequestedpacket)
 + [Trade Start Packet](#tradettartpacket)
 + [Update Packet](#updatepacket)
### Outgoing
 + [Accept Trade Packet](#accepttradepacket)
 + [Aoe Ack Packet](#aoeackpacket)
 + [Cancel Trade Packet](#canceltradepacket)
 + [Change Trade Packet](#changetradepacket)
 + [Create Packet](#createpacket)
 + [Goto Ack Packet](#gotoackpacket)
 + [Hello Packet](#hellopacket)
 + [Load Packet](#loadpacket)
 + [Move Packet](#movepacket)
 + [Player Text Packet](#playertextpacket)
 + [Pong Packet](#pongpacket)
 + [Request Trade Packet](#requesttradepacket)
 + [Shoot Ack Packet](#shootackpacket)
 + [Update Ack Packet](#updateackpacket)
 + [Use Portal Packet](#useportalpacket)
### Data Structures
 + [Ground Tile Data](#groundtiledata)
 + [Move Record](#moverecord)
 + [Object Data](#objectdata)
 + [Object Status Data](#objectstatusdata)
 + [Slot Object Data](#slotobjectdata)
 + [Stat Data](#statdata)
 + [Trade Item](#tradeitem)
 + [World Pos Data](#worldposdata)

# Incoming
## Arena
## ArenaDeath
Received when the player has been killed in the arena.
### Members
#### `cost: number`
The cost in gold to be revived.

## ImminentArenaWave
Received when a new arena wave is about to begin.
### Members
#### `currentRuntime: number`
The time which the player has been in the arena for.

## Pets
## DeletePetMessage
Received to notify the player that a pet has been deleted.
### Members
#### `petId: number`
The id of the pet which has been deleted.

## EvolvedPetMessage
Received to give the player information about a newly evolved pet.
### Members
#### `petId: number`
The id of the pet which has evolved.

#### `initialSkin: number`
The id of the current skin of the pet.

#### `finalSkin: number`
The id of the pets new skin.

## HatchPet
Recieved to give the player information about a newly hatched pet.
### Members
#### `petName: string`
The name of the hatched pet.

#### `petSkin: number`
The id of the pets skin.

## AoePacket
Received when an aoe bullet is fired.
### Members
#### `pos: WorldPosData`
The center of the area of effect.

#### `radius: number`
The radius of the area of effect.

#### `damage: number`
The damage dealt by the aoe entity.

#### `effect: number`
The effect applied by the aoe entity.

#### `duration: number`
The duration of the aoe effect.

#### `origType: number`
> Unkown.

#### `color: number`
The color of the aoe particle.
> The encoding is unknown.

## CreateSuccessPacket
Received in response to the `Create` packet.
### Members
#### `objectId: number`
The objectId of the connected player.

#### `charId: number`
The characterId of the connected player.

## EnemyShootPacket
Received when a visible enemy shoots a projectile.
### Members
#### `bulletId: number`
A unique identifer for the projectile.

#### `ownerId: number`
The object id of the enemy who fired the projectile.

#### `bulletType: number`
The type of the projectile. The bullet type can be used to find the projectile in the `Objects.xml` resource.

#### `startingPos: WorldPosData`
The position at which the projectile was fired.

#### `angle: number`
The angle at which the projectile was fired.

#### `damage: number`
The damage the projectile will deal to the player.

#### `numShots: number`
> Unknown. Probably the number of shots which are fired.

#### `angleInc: number`
> Unknown. Probably either the increase to `angle` over time or the increment between shots with regards to `numShots`.

## FailurePacket
Received when the client is deliberately disconnected.
### Members
#### `errorId: number`
The id of the error received.

#### `errorDescription: string`
A description of the error which caused the client to be disconnected.

## GotoPacket
Received when an object goes to a new position.
### Members
#### `objectId: number`
The objectId of the object moving.

#### `position: WorldPosData`
The new position of the object.

## MapInfoPacket
Received in response to the `Hello` packet. To load the map this should be replied to with a `Load` packet.
### Members
#### `width: number`
The width of the map in tiles.

#### `height: number`
The height of the map in tiles.

#### `name: string`
The name of the map.

#### `displayName: string`
The resource name of the map.

#### `difficulty: number`
The difficulty rating of the name.

#### `fp: number`
> Unknown.

#### `background: number`
> Unknown.

#### `allowPlayerTeleport: boolean`
Whether or not players can teleport to other players on the map.

#### `showDisplays: boolean`
> Unknown.

#### `clientXML: string[]`
> Unknown.

#### `extraXML: string[]`
> Unknown.

## NewTickPacket
Received every tick.
### Members
#### `tickId: number`
The tickId of the tick.

#### `tickTime: number`
The time in ms since the last tick. This is not always accurate, so it is better to calculate it
manually by keeping a timestamp of new tick packets.

#### `statuses: ObjectStatusData[]`
An array of [ObjectStatusData](#objectstatusdata) objects for all objects visible to the player.

## PingPacket
Received by the server occasionally.
### Members
#### `serial: number`
A unique number which is used in the reply to this packet.

## ReconnectPacket
Sent to prompt the client to reconnect to a different host.
### Members
#### `name: string`
The name of the host to reconnect to.

#### `host: string`
The IP of the host to reconnect to.

#### `port: number`
The port of the host to reconnect to.

#### `gameId: number`
The unique id of the host to reconnect to.

#### `keyTime: number`
The length of time which the host will be available to connect to for. If this is negative then the host will not expire.

#### `key: Int8Array`
> Unknown.

#### `isFromArena: boolean`
Whether or not the client is reconnecting from the arena.

## ServerPlayerShootPacket
Received when another player shoots.
### Members
#### `bulletId: number`
The id of the bullet which was fired.

#### `ownerId: number`
The objectId of the player who fired the bullet.

#### `containerType: number`
> Unknown.

#### `startingPos: WorldPosData`
The point where the bullet started.

#### `angle: number`
The angle the bullet was fired at. It is unknown whether the angle is in radians or degrees.

#### `damage: number`
The damage the bullet will do if it hits an enemy.

## TextPacket
Received when there is a new chat message
### Members
#### `name: string`
The name of the person who sent the chat message

#### `objectId: number`
The objectId of the person who sent the chat message.

#### `numStars: number`
The number of stars of the person who sent the chat message.

#### `bubbleTime: number`
The length of time to display the chat bubble for.

#### `recipient: string`
The recipient of the chat message. This is only used if the message is a private message.

#### `text: string`
The contents of the chat message.

#### `cleanText: string`
> Unknown.

## TradeAcceptedPacket
Received when a trade is accepted.
### Members
#### `clientOffer: boolean[]`
An array of booleans which describes which items in the players inventory are selected for the trade.

#### `partnerOffer: boolean[]`
An array of booleans which describes which items in the trade partner's inventory are selected for the trade.

## TradeChangedPacket
Received when the trade is changed.
### Members
#### `offer: boolean[]`
An array of boolean which describes which items in the trade partner's inventory are selected for the trade.

## TradeDonePacket
Received when the active trade has finished.
### Members
#### `code: TradeResult`
The result of the trade.
```typescript
enum TradeResult {
    Successful = 0,
    PlayerCanceled = 1
}
```

#### `description: string`
> Unknown.

## TradeRequestedPacket
Received when a trade is requested.
### Members
#### `name: string`
The name of the player who requested the trade.

## TradeStartPacket
Received when a trade is started.
### Members
#### `clientItems: TradeItem[]`
An array of [TradeItem](#tradeitem) objects which describe the player's inventory.

#### `partnerName: string`
The name of the trade partner.

#### `partnerItems: TradeItem[]`
An array of [TradeItem](#tradeitem) objects which describe the trade partner's inventory.

## UpdatePacket
Received when an update occurs.
### Members
#### `tiles: GroundTileData[]`
An array of [GroundTileData](#groundtiledata) objects which describe the current map.

#### `newObjects: ObjectData[]`
An array of [ObjectData](#objectdata) objects which describe the current objects visible to the player.

#### `drops: number[]`
An array of numbers which are objectIds of [ObjectData](#objectdata) objects which have gone out of view of the player.

# Outgoing
## AcceptTradePacket
Sent to accept the active trade.
### Members
#### `clientOffer: boolean[]`
An array of booleans which describe which items are selected in the players inventory.

#### `partnerOffer: boolean[]`
An array of booleans which describe which items are selected in the trade partner's inventory.

## AoeAckPacket
Sent to acknowledge the `AoePacket`
### Members
> This packet has no members.

## CancelTradePacket
Sent to cancel the active trade.
### Members
#### `objectId: number`
The objectId of the active trade partner.

## ChangeTradePacket
Sent to change your offer in the active trade.
### Members
#### `offer: boolean[]`
An array of booleans which describe which items in your inventory are selected.

## CreatePacket
Sent to create a new character.
### Members
#### `classType: number`
The class of the new character. This should be a value of the `Class` enum.

#### `skinType: number`
The skinId of the skin for the new character. `0` is the default skin.

## GotoAckPacket
Sent to acknowledge a `GotoPacket`.
### Members
#### `time: number`
The current client time.

## HelloPacket
Sent after the TCP socket is opened to ask for the `MapInfoPacket`.
### Members
#### `buildVersion: string`
The current build version of the game.

#### `gameId: number`
The id of the `MapInfo` packet to ask for.

#### `guid: string`
The unencrypted email address of the rotmg account.

#### `random1: number`
A randomly generated number.

#### `password: string`
The unencrypted password of the rotmg account.

#### `random2: number`
A randomly generated number.

#### `secret: string`
> Unknown.

#### `keyTime: number`
> Unknown.

#### `key: Int8Array`
> Unknown.

#### `mapJSON: string`
> Unknown.

#### `entryTag: string`
> Unknown.

#### `gameNet: string`
> Unknown.

#### `gameNetUserId: string`
> Unknown.

#### `playPlatform: string`
> Unknown.

#### `platformToken: string`
> Unknown.

#### `userToken: string`
> Unknown

## LoadPacket
Sent in reply to a `MapInfoPacket` to connect to the map.
### Members
#### `charId: number`
The characterId of the character to connect to the map with.

#### `isFromArena: boolean`
Whether or not the character is coming from the arena.

## MovePacket
Sent in reply to a `NewTickPacket` to relay the players position to the server.
### Members
#### `tickId: number`
The tickId of the `NewTickPacket` it is replying to.

#### `time: number`
The current client time.

#### `newPosition: WorldPosData`
The client's current position.

#### `records: MoveRecord[]`
> Unknown.

## PlayerTextPacket
Sent to send a chat message.
### Members
#### `text: string`
The contents of the chat message.

## PongPacket
Sent to acknowledge the `PingPacket`
### Members
#### `serial: number`
The `serial` property of the `PingPacket` this is replying to.

#### `time: number`
The current client time.

## RequestTradePacket
Sent to request a trade.
### Members
#### `name: string`
The name of the player to request a trade with.

## ShootAckPacket
Sent to acknowledge an `EnemyShootPacket`.
### Members
#### `time: number`
The current client time.

## UpdateAckPacket
Sent to acknowledge an `UpdatePacket`.
### Members
This packet has no members.

## UsePortalPacket
Sent to use a portal.
### Members
#### `objectId: number`
The object id of the portal to use.

# Data Structures
## GroundTileData
### Members
#### `x: number`
The x position of the tile.

#### `y: number`
The y position of the tile.

#### `type: number`
The tileId of the tile.

## MoveRecord
### Members
#### `time: number`
The time of the move record.

#### `x: number`
The x position of the move record.

#### `y: number`
The y position of the move record.

## ObjectData
### Members
#### `objectType: number`
The object type of the data.

#### `status: ObjectStatusData`
The data about the object.

## ObjectStatusData
### Members
#### `objectId: number`
The objectId of the object.

#### `pos: WorldPosData`
The position of the object,

#### `stats: StatData[]`
An array of the stats about the object.

### Methods
#### `processStatData(data: ObjectStatuData): IPlayerData`
Takes an [ObjectStatusData](#objectstatusdata) method and returns an `IPlayerData` object containing the info which was in the [ObjectStatusData](#objectstatusdata) object. It is up to the programmer to make sure the [ObjectStatusData](#objectstatusdata) is a type which can be turned into an `IPlayerData` object or not.

## SlotObjectData
### Members
#### `objectId: number`
The object id of the owner of the slot object.

#### `slotId: number`
The index of the slot. This includes the player's equiped items, so the first slot in the inventory is `4`.

#### `objectType: number`
The `type` of the object in the slot, or `-1` if it is empty.

## StatData
### Members
#### `statType: number`
The type of stat.

#### `statValue: number`
The value of the stat.

#### `stringStatValue: string`
The value of the stat if it is a string.

## TradeItem
### Members
#### `item: number`
The itemId of the item.

#### `slotType: number`
> Unknown.

#### `tradeable: boolean`
Whether or not the item is tradeable.

#### `included: boolean`
Whether or not the item is included in the trade.

## WorldPosData
### Members
#### `x: number`
The x position.

#### `y: number`
The y position.

### Methods
#### `squareDistanceTo(location: WorldPosData): number`
Returns the square of the distance between this and the `location` parameter.
