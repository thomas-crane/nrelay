/**
 * @module services/logging
 */
import { WriteStream } from 'fs';
import { LogLevel, LogProvider } from './logger';
import * as stringUtils from './string-utils';

/**
 * A logger which writes log messages to a `WriteStream`.
 */
export class FileLogger implements LogProvider {

  constructor(private logStream: WriteStream) { }

  log(sender: string, message: string, level: LogLevel): void {
    const senderString = (`[${stringUtils.getTime()} | ${sender}]`);
    const printString: string = stringUtils.pad(senderString, 30) + message;
    let levelString = LogLevel[level];
    if (!levelString) {
      levelString = 'custom';
    }
    this.logStream.write(stringUtils.pad(levelString.toUpperCase(), 8) + printString + '\n');
  }
}
