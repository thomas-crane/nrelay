import { ObjectStatusData } from '@realmlib/net';
import { ConditionEffect, hasEffect } from './condition-effect';
import { Entity } from './entity';
import { GameObject } from './object';

/**
 * An enemy game object.
 */
export class Enemy extends Entity {
  /**
   * The properties of this enemy as described by the Objects resource.
   */
  properties: GameObject;

  constructor(properties: GameObject, status: ObjectStatusData) {
    super(status);
    this.properties = properties;
  }

  /**
   * Calculates the amount of damage a bullet will apply to an enemy.
   * @param damage The amount of damage to apply.
   * @param armorPiercing Whether or not the damage is armor piercing.
   */
  damage(damage: number, armorPiercing: boolean = false): number {
    // tslint:disable-next-line: no-bitwise
    if (hasEffect(this.objectData.condition, ConditionEffect.INVINCIBLE | ConditionEffect.INVULNERABLE)) {
      return 0;
    }

    // work out the defense.
    let def = this.objectData.def;
    if (hasEffect(this.objectData.condition, ConditionEffect.ARMORED)) {
      def *= 2;
    }
    if (armorPiercing || hasEffect(this.objectData.condition, ConditionEffect.ARMORBROKEN)) {
      def = 0;
    }

    // work out the actual damage.
    const min = damage * 3 / 20;
    const actualDamage = Math.max(min, damage - def);
    return actualDamage;
  }
}
