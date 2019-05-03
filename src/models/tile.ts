/**
 * @module models
 */
/**
 * A game tile.
 */
export interface Tile {
  /**
   * The tile's type.
   */
  type: number;
  /**
   * The name of the tile.
   */
  id: string;
  /**
   * Whether or not the player will sink when standing on this tile.
   */
  sink: boolean;
  /**
   * The speed multiplier of this tile.
   */
  speed: number;
  /**
   * Whether or not this tile can be walked on.
   */
  noWalk: boolean;
  /**
   * The minimum amount of damage this tile can cause.
   */
  minDamage?: number;
  /**
   * The maximum amount of damage this tile can cause.
   */
  maxDamage?: number;
}
