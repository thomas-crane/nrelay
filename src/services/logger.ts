import chalk from 'chalk';

export interface LogProvider {
  log(sender: string, message: string, level: LogLevel): void;
}

export class Logger {
  static loggers: LogProvider[] = [];

  static addLogger(logger: LogProvider): void {
    this.loggers.push(logger);
  }
  static resetLoggers(): void {
    this.loggers = [];
  }
  static log(sender: string, message: string, level: LogLevel = LogLevel.Message): void {
    for (const logger of this.loggers) {
      try {
        logger.log(sender, message, level);
      } catch (error) {
        // console.log is the only reliable logger at this point.
        console.log(`${chalk.bgRedBright('ERROR')} while calling log() on the logger class: ${logger.constructor.name}.`);
        console.error(error);
      }
    }
  }
}

export enum LogLevel {
  Debug,
  Info,
  Message,
  Warning,
  Error,
  Success,
}
