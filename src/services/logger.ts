import * as chalk from 'chalk';

const c = chalk.constructor();
export function Log(sender: string, message: string, level: LogLevel = LogLevel.Message): void {
    let printString: string;
    switch (level) {
        case LogLevel.Info:
        printString = c.gray('[' + sender + '] ' + message);
        break;
        case LogLevel.Message:
        printString = ('[' + sender + '] ' + message);
        break;
        case LogLevel.Warning:
        printString = c.yellow('[' + sender + '] ' + message);
        break;
        case LogLevel.Error:
        printString = c.red('[' + sender + '] ' + message);
        break;
        case LogLevel.Success:
        printString = c.green('[' + sender + '] ' + message);
        break;
        default:
        printString = message;
        break;
    }
    console.log(printString);
}

export enum LogLevel {
    Info,
    Message,
    Warning,
    Error,
    Success,
}
