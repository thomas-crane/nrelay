/**
 * @module services/pathfinding
 */
/**
 * An update to a pathfinder node.
 */
export interface NodeUpdate {
  /**
   * The X coordinate of the node.
   */
  x: number;
  /**
   * The Y coordinate of the node.
   */
  y: number;
  /**
   * Whether or not the node can be walked on.
   */
  walkable: boolean;
}
