export interface HeapItem<T> {
  heapIndex: number;
  compareTo(item: T): number;
}
