/**
 * @module models
 */
import { GroundTileData } from '@realmlib/net';
/**
 * A ground tile with some additional info.
 */
export declare type MapTile = GroundTileData & {
  /**
   * Whether or not the tile is occupied by an object.
   */
  occupied: boolean,
  /**
   * The object id of the object which occupies this map tile.
   */
  occupiedBy: number | undefined,
  /**
   * Whether or not this tile protects from ground damage.
   */
  protectFromGroundDamage: boolean,
  /**
   * The client time when this tile caused damage to the client.
   */
  lastDamage: number,
};
