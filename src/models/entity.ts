import { ObjectStatusData, Point, StatType } from '@realmlib/net';
import * as parsers from '../util/parsers';
import { PlayerData } from './playerdata';

/**
 * An entity which exists in the game.
 */
export class Entity {
  /**
   * Stat information of the entity, such as HP and defense.
   */
  objectData: PlayerData;
  /**
   * The client time of the last update that this entity received.
   */
  lastUpdate: number;
  /**
   * The position of the entity as received in a `NewTick` packet.
   */
  tickPos: Point;
  /**
   * The position of the entity at a particular game tick.
   */
  posAtTick: Point;
  /**
   * The velocity of the entity.
   */
  moveVector: Point;
  /**
   * The tick id of the last game tick received by this entity.
   */
  lastTickId: number;
  /**
   * The current position of the entity.
   */
  currentPos: Point;
  /**
   * Whether or not this entity is dead.
   */
  dead: boolean;
  private deadCounter: number;

  constructor(status: ObjectStatusData) {
    this.objectData = parsers.processObjectStatus(status);
    this.lastUpdate = 0;
    this.lastTickId = -1;
    this.deadCounter = 0;
    this.dead = false;
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

  /**
   * Updates the entity based on the tick info.
   * @param objectStatus The object status of this entity.
   * @param tickTime The time of this tick.
   * @param tickId The tick id of this tick.
   * @param clientTime The client time of this tick.
   */
  onNewTick(objectStatus: ObjectStatusData, tickTime: number, tickId: number, clientTime: number): void {
    for (const status of objectStatus.stats) {
      if (status.statType === StatType.HP_STAT) {
        if (this.dead && status.statValue > 1 && ++this.deadCounter >= 2) {
          this.dead = false;
        }
        break;
      }
    }
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

  /**
   * Updates this entities state based on the current frame.
   * @param lastTick The last tick id.
   * @param clientTime The current client time.
   */
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

  /**
   * The square distance from some point to this entity.
   */
  squareDistanceTo<T extends Point>(point: T): number {
    const a = point.x - this.currentPos.x;
    const b = point.y - this.currentPos.y;
    return a ** 2 + b ** 2;
  }

  /**
   * Updates this entity based on a goto packet.
   * @param x The X position to go to.
   * @param y The Y position to go to.
   * @param time The client time.
   */
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
