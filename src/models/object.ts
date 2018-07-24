/**
 * An object loaded from the Objects resource
 */
export interface GameObject {
  /**
   * The object type.
   */
  type: number;
  /**
   * The name of the object.
   */
  id: string;
  /**
   * Whether or not the object is an enemy.
   */
  enemy: boolean;
  /**
   * Whether or not the object is an item.
   */
  item: boolean;
  /**
   * Whether or not the object is a god.
   */
  god: boolean;
  /**
   * Whether or not the object is a pet.
   */
  pet: boolean;
  /**
   * The slot type which this object is for, if it is an item.
   */
  slotType: number;
  /**
   * The type of bag that this object is dropped in, if it is an item.
   */
  bagType: number;
  /**
   * The category of this object, such as `Equipment` or `Dye`.
   */
  class: string;
  /**
   * The max HP of this object, if it is an enemy.
   */
  maxHitPoints: number;
  /**
   * The defense of this object, if it is an enemy.
   */
  defense: number;
  /**
   * The XP multiplier of this object, if it is an enemy.
   */
  xpMultiplier: number;
  /**
   * The projcetiles fired by this object, if it is an enemy.
   */
  projectiles: ProjectileInfo[];
  /**
   * The first projectile in the `projectiles` array.
   * @see `GameObject.projectiles`
   */
  projectile: ProjectileInfo;
  /**
   * The stat bonuses activated when this object is equipped, if it is an item.
   */
  activateOnEquip: Array<{
    /**
     * The type of stat which is affected.
     */
    statType: number;
    /**
     * The change applied to the stat.
     */
    amount: number;
  }>;
  /**
   * The rate of fire of this object, if it is an item.
   */
  rateOfFire: number;
  /**
   * The number of projectiles fired by this object, if it is an item.
   */
  numProjectiles: number;
  /**
   * The angle (in degrees) between shots fired by this object, if it is an item.
   */
  arcGap: number;
  /**
   * The fame bonus applied when this object is equipped, if it is an item.
   */
  fameBonus: number;
  /**
   * The feed power of this object.
   */
  feedPower: number;
  /**
   * Whether or not this object occupies a square on the map.
   */
  occupySquare: boolean;
  /**
   * Whether or not the object occupies the entire square.
   */
  fullOccupy: boolean;
}

/**
 * The properties of a projectile loaded from the Objects resource.
 */
export interface ProjectileInfo {
  /**
   * A local identifier for the projectile if this projectile is part of a list.
   */
  id: number;
  /**
   * The name of the projectile.
   */
  objectId: string;
  /**
   * The damage applied by this projectile, if it is not given by a range.
   */
  damage: number;
  /**
   * The minimum damage applied by this projectile, if it is not given by the `damage`.
   */
  minDamage: number;
  /**
   * The maximum damage applied by this projectile, if it is not given by the `damage`.
   */
  maxDamage: number;
  /**
   * The speed of this projectile. Units are unknown, but most likely tiles/second
   */
  speed: number;
  /**
   * The lifetime of this projectile, in milliseconds.
   */
  lifetimeMS: number;
  /**
   * Whether or not this projectile follows a parametric path (like Bulwark projectiles do).
   */
  parametric: boolean;
  /**
   * Whether or not this projectile follows a wavy path (like staff projectiles do).
   */
  wavy: boolean;
  /**
   * Whether or not this projectile changes direction during it's lifetime.
   */
  boomerang: boolean;
  /**
   * Whether or not this projectile hits multiple entities.
   */
  multihit: boolean;
  /**
   * Whether or not this projectile passes through obstacles.
   */
  passesCover: boolean;
  /**
   * The amplitude of the wave, if this projectile is `wavy`.
   */
  amplitude: number;
  /**
   * The frequency of the wave, if this projectile is `wavy`.
   */
  frequency: number;
  /**
   * Unknown.
   */
  magnitude: number;
  /**
   * A list of condition effects applied by this projectile.
   *
   * Note that effects are applied by the server independently of this
   * list, and modifying this list will not change the effects applied.
   */
  conditionEffects: Array<{
    /**
     * The name of the effect.
     */
    effectName: string;
    /**
     * The duration of the effect, in seconds.
     */
    duration: number;
  }>;
}
