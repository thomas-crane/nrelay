/**
 * @module models
 */
import { ObjectStatusData } from '@realmlib/net';
import { Point } from '../services/pathfinding/point';
import * as parsers from '../util/parsers';
import { GameObject } from './object';
import { PlayerData } from './playerdata';

/**
 * An enemy game object.
 */
export class Enemy {
  /**
   * Stat information of the enemy, such as HP and defense.
   */
  objectData: PlayerData;
  /**
   * The properties of this enemy as described by the Objects resource.
   */
  properties: GameObject;
  /**
   * Whether or not this enemy is dead.
   */
  dead: boolean;
  /**
   * The client time of the last update that this enemy received.
   */
  lastUpdate: number;
  /**
   * The position of the enemy as received in a `NewTick` packet.
   */
  tickPos: Point;
  /**
   * The position of the enemy at a particular game tick.
   */
  posAtTick: Point;
  /**
   * The velocity of the enemy.
   */
  moveVector: Point;
  /**
   * The tick id of the last game tick received by this enemy.
   */
  lastTickId: number;
  /**
   * The current position of the enemy.
   */
  currentPos: Point;

  constructor(properties: GameObject, status: ObjectStatusData) {
    this.properties = properties;
    this.objectData = parsers.processObjectStatus(status);
    this.dead = false;
    this.lastUpdate = 0;
    this.lastTickId = -1;
    this.currentPos = status.pos.clone();
    this.tickPos = {
      x: this.currentPos.x,
      y: this.currentPos.y,
    };
    this.posAtTick = {
      x: this.currentPos.x,
      y: this.currentPos.y,
    };
    this.moveVector = {
      x: 0,
      y: 0,
    };
  }

  onNewTick(objectStatus: ObjectStatusData, tickTime: number, tickId: number, clientTime: number): void {
    this.objectData = parsers.processObjectStatus(objectStatus, this.objectData);
    if (this.lastTickId < tickId) {
      this.moveTo(this.tickPos.x, this.tickPos.y);
    }
    this.lastUpdate = clientTime;
    this.tickPos.x = objectStatus.pos.x;
    this.tickPos.y = objectStatus.pos.y;
    this.posAtTick.x = this.currentPos.x;
    this.posAtTick.y = this.currentPos.y;
    this.moveVector = {
      x: (this.tickPos.x - this.posAtTick.x) / tickTime,
      y: (this.tickPos.y - this.posAtTick.y) / tickTime,
    };
    this.lastTickId = tickId;
    this.lastUpdate = clientTime;
  }

  squareDistanceTo<T extends Point>(point: T): number {
    const a = point.x - this.currentPos.x;
    const b = point.y - this.currentPos.y;
    return a ** 2 + b ** 2;
  }

  damage(damage: number): number {
    const min = damage * 3 / 20;
    const actualDamge = Math.max(min, damage - this.objectData.def);
    return actualDamge;
  }

  frameTick(lastTick: number, clientTime: number): void {
    if (!(this.moveVector.x === 0 && this.moveVector.y === 0)) {
      if (this.lastTickId < lastTick) {
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveTo(this.tickPos.x, this.tickPos.y);
      } else {
        const time = clientTime - this.lastUpdate;
        const dX = this.posAtTick.x + time * this.moveVector.x;
        const dY = this.posAtTick.y + time * this.moveVector.y;
        this.moveTo(dX, dY);
      }
    }
  }

  onGoto(x: number, y: number, time: number): void {
    this.moveTo(x, y);
    this.tickPos.x = x;
    this.tickPos.y = y;
    this.posAtTick.x = x;
    this.posAtTick.y = y;
    this.moveVector.x = 0;
    this.moveVector.y = 0;
    this.lastUpdate = time;
  }

  private moveTo(x: number, y: number): void {
    this.currentPos.x = x;
    this.currentPos.y = y;
  }
}
