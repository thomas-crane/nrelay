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
};
