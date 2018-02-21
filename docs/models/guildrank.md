# GuildRank
This is an enum which stores the number codes of all guild ranks.

Example usage:
```typescript
const playerData: IPlayerData = getMyPlayerDataSomehow();
Log('Guild Shower', 'Your guild rank is: ' + GuildRank[playerData.guildRank]);
```
The enum values are:
```typescript
enum enum GuildRank {
    NoRank = -1,
    Initiate = 0,
    Member = 10,
    Officer = 20,
    Leader = 30,
    Founder = 40
}
```
