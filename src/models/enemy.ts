import { ObjectStatusData, Point } from '@realmlib/net';
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
  /**
   * Whether or not this enemy is dead.
   */
  dead: boolean;

  constructor(properties: GameObject, status: ObjectStatusData) {
    super(status);
    this.properties = properties;
  }

  damage(damage: number): number {
    const min = damage * 3 / 20;
    const actualDamge = Math.max(min, damage - this.objectData.def);
    return actualDamge;
  }
}
