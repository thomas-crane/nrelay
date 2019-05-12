/**
 * @deprecated Use the exported function `hasEffect` instead.
 */
export class ConditionEffects {
  /**
   * @deprecated Use the exported function `hasEffect` instead.
   */
  static has(condition: number, effect: ConditionEffect): boolean {
    // tslint:disable no-bitwise
    const effectBit = 1 << effect - 1;
    return (condition & effectBit) === 1;
    // tslint:enable no-bitwise
  }
}

/**
 * Determines whether or not the given `condition` value has the
 * `effect` bit set.
 *
 * @example
 * const isDazed = hasEffect(this.condition, ConditionEffect.DAZED);
 *
 * @param condition The condition stat to check.
 * @param effect The effect to determine if the condition value has or not.
 */
export function hasEffect(condition: number, effect: ConditionEffect): boolean {
  // tslint:disable no-bitwise
  const effectBit = 1 << effect - 1;
  return (condition & effectBit) === 1;
  // tslint:enable no-bitwise
}

/**
 * The values of all condition effects in the game.
 */
export enum ConditionEffect {
  NOTHING = 0,
  DEAD = 1,
  QUIET = 2,
  WEAK = 3,
  SLOWED = 4,
  SICK = 5,
  DAZED = 6,
  STUNNED = 7,
  BLIND = 8,
  HALLUCINATING = 9,
  DRUNK = 10,
  CONFUSED = 11,
  STUN_IMMUNE = 12,
  INVISIBLE = 13,
  PARALYZED = 14,
  SPEEDY = 15,
  BLEEDING = 16,
  NOT_USED = 17,
  HEALING = 18,
  DAMAGING = 19,
  BERSERK = 20,
  PAUSED = 21,
  STASIS = 22,
  STASIS_IMMUNE = 23,
  INVINCIBLE = 24,
  INVULNERABLE = 25,
  ARMORED = 26,
  ARMORBROKEN = 27,
  HEXED = 28,
  NINJA_SPEEDY = 29,
}
