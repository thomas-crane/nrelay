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
 + [Ally Shoot Packet](#allyshootpacket)
 + [Aoe Packet](#aoepacket)
 + [Buy Result Packet](#buyresultpacket)
 + [Client Stat Packet](#clientstatpacket)
 + [Create Success Packet](#createsuccesspacket)
 + [Damage Packet](#damagepacket)
 + [Death Packet](#deathpacket)
 + [Enemy Shoot Packet](#enemyshootpacket)
 + [Failure Packet](#failurepacket)
 + [Global Notification Packet](#globalnotificationpacket)
 + [Goto Packet](#gotopacket)
 + [Guild Result Packet](#guildresultpacket)
 + [Inv Result Packet](#invresultpacket)
 + [Invited To Guild Packet](#invitedtoguildpacket)
 + [Key Info Response Packet](#keyinforesponsepacket)
 + [Map Info Packet](#mapinfopacket)
 + [Name Result Packet](#nameresultpacket)
 + [New Ability Packet](#newabilitypacket)
 + [New Tick Packet](#newtickpacket)
 + [Notification Packet](#notificationpacket)
 + [Password Prompt Packet](#passwordpromptpacket)
 + [Ping Packet](#pingpacket)
 + [Quest ObjectId Packet](#questobjectidpacket)
 + [Quest Redeem Response Packet](#questredeemresponsepacket)
 + [Reconnect Packet](#reconnectpacket)
 + [Reskin Unlock Packet](#reskinunlockpacket)
 + [Server Player Shoot Packet](#serverplayershootpacket)
 + [Show Effect Packet](#showeffectpacket)
 + [Text Packet](#textpacket)
 + [Trade Accepted Packet](#tradeacceptedpacket)
 + [Trade Changed Packet](#tradechangedpacket)
 + [Trade Done Packet](#tradedonepacket)
 + [Trade Requested Packet](#traderequestedpacket)
 + [Trade Start Packet](#tradettartpacket)
 + [Update Packet](#updatepacket)
 + [Verify Email Packet](#verifyemailpacket)
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

## AccountListPacket
> Unknown.
### Members
#### `accountListId: number`
The id of the account list.

#### `accountIds: string[]`
The account ids associated with this account list.

#### `lockAction: number`
> Unknown.

## AllyShootPacket
Received when another player shoots a projectile.
### Members
#### `bulletId: number`
A unique identifer for the projectile.

#### `ownerId: number`
The object id of the player who fired the projectile.

#### `containerType: number`
> Unknown.

#### `angle: number`
The angle at which the projectile was fired at.

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

## BuyResult
Received in response to a `BuyPacket`.
### Members
#### `result: number`
The code of the result.

#### `resultString: string`
A string version of the result.

## ClientStatPacket
Received to give the player information about their stats.
### Members
#### `name: string`
The name of the stat which the information is for.

#### `value: number`
The value of the stat.

## CreateSuccessPacket
Received in response to the `Create` packet.
### Members
#### `objectId: number`
The objectId of the connected player.

#### `charId: number`
The characterId of the connected player.

## DamagePacket
Received when the player takes damage.
### Members
#### `targetId: number`
> Unknown. Probably the object id of the target of the damage.

#### `effects: number[]`
An array of status effects which are applied along with the damage.

#### `damageAmount: number`
The amount of damage taken.

#### `kill: boolean`
Whether or not the damage will kill the player.

#### `bulletId: number`
The bullet id of the projectile which caused the damage.

#### `objectId: number`
> Unknown. Probably the object id of the enemy which fired the projectile.

## DeathPacket
Received when a player has died.
### Members
#### `accountId: string`
The account id of the player who died.

#### `charId: number`
The character id of the character who died.

#### `killedBy: string`
The cause of the death.

#### `zombieId: number`
The object id of the zombie if one has been spawned.

#### `zombieType: number`
The type of zombie if one has been spawned.

#### `isZombie: boolean`
This property is the result of `zombieId != -1`.

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

## GlobalNotificationPacket
Received when a global notification is sent out to all players.
### Members
#### `notificationType: number`
An id to identify the type of notification which has been sent.

#### `text: string`
The notification message.

## GotoPacket
Received when an object goes to a new position.
### Members
#### `objectId: number`
The objectId of the object moving.

#### `position: WorldPosData`
The new position of the object.

## GuildResultPacket
> Unknown.
### Members
#### `success: boolean`
Whether the result of the guild operation was successful or not.

#### `lineBuilderJSON: string`
> Unknown.

## InvResultPacket
> Unknown.
### Members
#### `result: number`
> Unknown.

## InvitedToGuildPacket
Received when the player is invited to a guild.
### Members
#### `name: string`
The name of player who sent the invite.

#### `guildName: string`
The name of the guild.

## KeyInfoResponsePacket
> Unknown.
### Members
#### `name: string`
> Unknown.

#### `description: string`
> Unknown.

#### `creator: string`
> Unknown.

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

## NameResultPacket
Received to provide information about a player's request to set their name.
### Members
#### `success: boolean`
Whether or not the name has been given to the player.

#### `errorText: string`
The error if one has occurred.

## NewAbilityPacket
Received when a new ability has been unlocked by the player.
### Members
#### `abilityType: number`
The type of ability which has been unlocked.

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

## NotificationPacket
Received when a notification is received by the player.
### Members
#### `objectId: number`
The object id of the object to display the notification for.

#### `message: string`
The message of the notification.

#### `color: number`
The color of the notification.
> The encoding is unknown.

## PasswordPromptPacket
Received to prompt the player to enter their password.
### Members
#### `cleanPasswordStatus: number`
> Unknown.

## PingPacket
Received by the server occasionally.
### Members
#### `serial: number`
A unique number which is used in the reply to this packet.

## QuestObjectIdPacket
Received to tell the player the object id of their current quest.
### Members
#### `objectId: number`
The object id of the current quest.

## QuestRedeemResponsePacket
> Unknown.
### Members
#### `ok: boolean`
> Unknown.

#### `message: string`
> Unknown.

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

## ReskinUnlockPacket
Received to notify the player that a reskin has been unlocked.
### Members
#### `skinId: number`
The id of the skin which has been unlocked.

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

## ShowEffectPacket
Received to tell the player to display an effect such as an AOE grenade.
### Members
#### `effectType: number`
The type of effect to display.

#### `targetObjectId: number`
> Unknown.

#### `pos1: WorldPosData`
> Unknown. Probably the start position of the effect.

#### `pos2: WorldPosData`
> Unknown. Probably the end position of the effect.

#### `color: number`
The color of the effect
> The encoding is unknown.

#### `duration: number`
The duration of the effect.

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

## VerifyEmailPacket
Received to prompt the player to verify their email.
### Members
> This packet has no members.

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
