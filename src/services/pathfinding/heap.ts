import { IHeapItem } from './heap-item';

export class Heap<T extends IHeapItem<T>> {

    private items: T[];
    private heapSize: number;
    private maxHeapSize: number;

    constructor(maxHeapSize: number) {
        this.heapSize = 0;
        this.maxHeapSize = maxHeapSize;
        this.items = new Array<T>(this.maxHeapSize);
    }

    public get count(): number {
        return this.heapSize;
    }

    public add(item: T): void {
        item.heapIndex = this.heapSize;
        this.items[this.heapSize] = item;
        this.sortUp(item);
        this.heapSize++;
    }

    public removeFirst(): T {
        const first = this.items[0];
        this.heapSize--;
        this.items[0] = this.items[this.heapSize];
        this.items[0].heapIndex = 0;
        this.sortDown(this.items[0]);
        return first;
    }

    public update(item: T): void {
        this.sortUp(item);
    }

    public contains(item: T): boolean {
        if (!this.items[item.heapIndex]) {
            return false;
        }
        return item === this.items[item.heapIndex];
    }

    private sortDown(item: T): void {
        while (true) {
            const swapLeft = item.heapIndex * 2 + 1;
            const swapRight = item.heapIndex * 2 + 2;
            let swapIndex = 0;

            if (swapLeft < this.heapSize) {
                swapIndex = swapLeft;
                if (swapRight < this.heapSize) {
                    if (this.items[swapLeft].compareTo(this.items[swapRight]) < 0) {
                        swapIndex = swapRight;
                    }
                }
                if (item.compareTo(this.items[swapIndex]) < 0) {
                    this.swap(item, this.items[swapIndex]);
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }

    private sortUp(item: T): void {
        let parentIndex = Math.round((item.heapIndex - 1) / 2);

        while (true) {
            const parent: T = this.items[parentIndex];
            if (item.compareTo(parent) > 0) {
                this.swap(item, parent);
            } else {
                break;
            }
            parentIndex = Math.round((item.heapIndex - 1) / 2);
        }
    }

    private swap(itemA: T, itemB: T): void {
        this.items[itemA.heapIndex] = itemB;
        this.items[itemB.heapIndex] = itemA;
        const aIndex = itemA.heapIndex;
        itemA.heapIndex = itemB.heapIndex;
        itemB.heapIndex = aIndex;
    }
}
