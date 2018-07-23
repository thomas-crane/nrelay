import { Hashable } from './hashable';

export class HashSet<T extends Hashable> {
  private map: {
    [hash: string]: T;
  };

  constructor() {
    this.map = {};
  }

  add(item: T): void {
    const hash = item.hash();
    this.map[hash] = item;
  }

  remove(item: T): void {
    const hash = item.hash();
    if (this.map[hash]) {
      delete this.map[hash];
    }
  }

  contains(item: T): boolean {
    return this.map.hasOwnProperty(item.hash());
  }
}
