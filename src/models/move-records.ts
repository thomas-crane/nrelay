import { MoveRecord } from '@realmlib/net';

/**
 * This code is mostly ported from the RotMG game client. It's
 * exact functionality is unknown.
 */
export class MoveRecords {
  lastClearTime: number;
  records: MoveRecord[];

  constructor() {
    this.lastClearTime = -1;
    this.records = [];
  }

  addRecord(time: number, x: number, y: number): void {
    if (this.lastClearTime < 0) {
      return;
    }
    const id = this.getId(time);
    if (id < 1 || id > 10) {
      return;
    }
    if (this.records.length === 0) {
      const record = new MoveRecord();
      record.x = x;
      record.y = y;
      record.time = time;
      this.records.push(record);
      return;
    }
    const currentRecord = this.records[this.records.length - 1];
    const currentId = this.getId(currentRecord.time);
    if (id !== currentId) {
      const record = new MoveRecord();
      record.x = x;
      record.y = y;
      record.time = time;
      this.records.push(record);
      return;
    }
    const score = this.getScore(id, time);
    const currentScore = this.getScore(currentId, currentRecord.time);
    if (score < currentScore) {
      currentRecord.time = time;
      currentRecord.x = x;
      currentRecord.y = y;
      return;
    }
  }

  clear(time: number): void {
    this.records = [];
    this.lastClearTime = time;
  }

  private getId(time: number): number {
    return Math.round((time - this.lastClearTime + 50) / 100);
  }

  private getScore(id: number, time: number): number {
    return Math.round(Math.abs(time - this.lastClearTime - id * 100));
  }
}
