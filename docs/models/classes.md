# Classes
This is an enum which stores the object types of all classes in the game.

Example usage:
```typescript
for (let i = 0; i < updatePacket.newObjects.length; i++) {
    const objectType = updatePacket.newObjects[i].objectType;
    if (Classes[objectType]) {
        Log('Class test', 'Spotted a ' + Classes[objectType] + ' in the nexus');
    }
}
```
The enum values are:
```typescript
enum Classes {
    Rogue = 768,
    Archer = 775,
    Wizard = 782,
    Priest = 784,
    Warrior = 797,
    Knight = 798,
    Paladin = 799,
    Assassin = 800,
    Necromancer = 801,
    Huntress = 802,
    Mystic = 803,
    Trickster = 804,
    Sorcerer = 805,
    Ninja = 806
}
```
