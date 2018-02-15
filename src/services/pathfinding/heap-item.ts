export interface IHeapItem<T> {
    heapIndex: number;
    compareTo(item: T): number;
}
