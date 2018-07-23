import { PacketType } from './packet-type';
import { Logger, LogLevel } from '../core';

export interface PacketIdMap {
  [id: number]: PacketType;
}

export class Mapper {

  static readonly map: Map<number, PacketType> = new Map<number, PacketType>();
  static readonly reverseMap: Map<PacketType, number> = new Map<PacketType, number>();

  static mapIds(ids: PacketIdMap): void {
    this.map.clear();
    this.reverseMap.clear();
    for (const type in ids) {
      if (ids.hasOwnProperty(type)) {
        this.map.set(+type, ids[type]);
        this.reverseMap.set(ids[type], +type);
      }
    }
    Logger.log('Mapper', `Mapped ${this.map.size} packet ids.`, LogLevel.Info);
  }
}
