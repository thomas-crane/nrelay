import chalk from 'chalk';
import { environment } from './../models';
import { WriteStream } from 'fs';

export class Logger {
    static logStream: WriteStream;
}

export enum LogLevel {
    Info,
    Message,
    Warning,
    Error,
    Success,
}

export function Log(sender: string, message: string, level: LogLevel = LogLevel.Message): void {
    const senderString = (`[${getTime()} | ${sender}]`);
    let printString: string = pad(senderString, 30) + message;
    if (Logger.logStream && environment.log) {
        Logger.logStream.write(pad(LogLevel[level].toUpperCase(), 8) + printString + '\n');
    }
    switch (level) {
        case LogLevel.Info:
            printString = chalk.gray(printString);
            break;
        case LogLevel.Message:
            printString = (printString);
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
        default:
            printString = message;
            break;
    }
    console.log(printString);
}

function getTime(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function pad(str: string, paddingLength: number): string {
    if (str.length > paddingLength) {
        return str;
    }
    return (str + ' '.repeat(paddingLength - str.length));
}
