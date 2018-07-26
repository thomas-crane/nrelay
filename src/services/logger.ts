/**
 * @module services/logging
 */
import chalk from 'chalk';

/**
 * An object which can be used to provide logging or output.
 */
export interface LogProvider {
  log(sender: string, message: string, level: LogLevel): void;
}

/**
 * A static singleton class used to expose the logging mechanism.
 *
 * Logging is provided through the use of a logging chain. When `log`
 * is called, the logger iterates over each logger in the chain calling
 * `log` on each individual logger.
 */
export class Logger {
  static loggers: LogProvider[] = [];

  /**
   * Adds a new logger to the end of the logging chain.
   */
  static addLogger(logger: LogProvider): void {
    this.loggers.push(logger);
  }
  /**
   * Clears the logging chain.
   */
  static resetLoggers(): void {
    this.loggers = [];
  }
  /**
   * Logs a message using each logger in the chain.
   * @param sender The sender of the message.
   * @param message The message.
   * @param level The level of the message.
   */
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

/**
 * A description of the nature of a log message.
 * Since the levels also represent values (`Debug` is `0`, and `Success` is `5`), they may be
 * used to filter out messages before logging.
 * @example
 * if (level < LogLevel.Message) return; // ignore Debug and Info.
 */
export enum LogLevel {
  /**
   * For debug purposes, and probably
   * only needs to be logged when running in a debug environment.
   */
  Debug,
  /**
   * Used to log progress of a long running task, or the state of
   * a system.
   */
  Info,
  /**
   * The standard level of output. Similar to `console.log`.
   */
  Message,
  /**
   * Used when an error has occurred which is not fatal.
   */
  Warning,
  /**
   * Used when a fatal error has occurred that prevents some
   * part of the program from functioning correctly.
   */
  Error,
  /**
   * Used when an operation has completed successfully.
   */
  Success,
}
