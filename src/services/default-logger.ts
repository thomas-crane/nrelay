/**
 * @module services/logging
 */
import chalk from 'chalk';
import { LogLevel, LogProvider } from './logger';
import * as stringUtils from './string-utils';

/**
 * The default logger used by the CLI.
 */
export class DefaultLogger implements LogProvider {

  constructor(private minLevel: LogLevel = LogLevel.Info) { }

  log(sender: string, message: string, level: LogLevel): void {
    if (level < this.minLevel) {
      return;
    }
    const senderString = (`[${stringUtils.getTime()} | ${sender}]`);
    let printString: string = stringUtils.pad(senderString, 30) + message;
    switch (level) {
      case LogLevel.Debug:
      case LogLevel.Info:
        printString = chalk.gray(printString);
        break;
      case LogLevel.Warning:
        printString = chalk.yellow(printString);
        break;
      case LogLevel.Error:
        printString = chalk.red(printString);
        break;
      case LogLevel.Success:
        printString = chalk.green(printString);
        break;
    }
    // tslint:disable-next-line: no-console
    console.log(printString);
  }
}
