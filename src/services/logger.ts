import * as chalk from 'chalk';

const c = chalk.constructor();
export function Log(sender: string, message: string, level: SeverityLevel = SeverityLevel.Message): void {
    let printString: string;
    switch (level) {
        case SeverityLevel.Info:
        printString = c.gray('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Message:
        printString = ('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Warning:
        printString = c.yellow('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Error:
        printString = c.red('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Success:
        printString = c.green('[' + sender + '] ' + message);
        break;
        default:
        printString = message;
        break;
    }
    console.log(printString);
}

export enum SeverityLevel {
    Info,
    Message,
    Warning,
    Error,
    Success,
}
