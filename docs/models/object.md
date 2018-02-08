# Object
This class exports the `IObject` interface represents an object from the `Objects.json` file.

### [Exported interfaces](#exported-interfaces)
 + [`IObject`](#iobject)

### Exported interfaces
#### `IObject`
```typescript
interface IObject {
    type: number;
    id: string;
    enemy: boolean;
    item: boolean;
    god: boolean;
    pet: boolean;
    slotType: number;
    bagType: number;
    class: string;
    maxHitPoints: number;
    defense: number;
    xpMultiplier: number;
    projectile: {
        id: number;
        objectId: string;
        damage: number;
        minDamage: number;
        maxDamage: number;
        speed: number;
        lifetimeMS: number;
    };
    activateOnEquip: Array<{
        statType: number;
        amount: number;
    }>;
    rateOfFire: number;
    fameBonus: number;
    feedPower: number;
    occupySquare: boolean;
    fullOccupy: boolean;
}
```
The properties correspond to properties found in the `Objects.json` file. 
