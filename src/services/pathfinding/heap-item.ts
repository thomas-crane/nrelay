/**
 * @module services/pathfinding
 */
/**
 * An item in a heap.
 */
export interface HeapItem<T> {
  /**
   * The item's index in the heap.
   */
  heapIndex: number;
  /**
   * Compares this to `item` to determine a sorting order.
   * @param item The item to compare with.
   */
  compareTo(item: T): number;
}
