export interface IObject {
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
    projectiles: IProjectile[];
    projectile: IProjectile;
    activateOnEquip: Array<{
        statType: number;
        amount: number;
    }>;
    rateOfFire: number;
    numProjectiles: number;
    arcGap: number;
    fameBonus: number;
    feedPower: number;
    occupySquare: boolean;
    fullOccupy: boolean;
}

export interface IProjectile {
    id: number;
    objectId: string;
    damage: number;
    minDamage: number;
    maxDamage: number;
    speed: number;
    lifetimeMS: number;
    parametric: boolean;
    wavy: boolean;
    boomerang: boolean;
    multihit: boolean;
    passesCover: boolean;
    amplitude: number;
    frequency: number;
    magnitude: number;
    conditionEffects: Array<{
        effectName: string;
        duration: number;
    }>;
}
