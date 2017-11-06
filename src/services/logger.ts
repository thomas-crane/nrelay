import * as chalk from 'chalk';

export function Log(sender: string, message: string, level: SeverityLevel = SeverityLevel.Message): void {
    let printString: string;
    switch (level) {
        case SeverityLevel.Info:
        printString = chalk.gray('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Message:
        printString = ('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Warning:
        printString = chalk.yellow('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Error:
        printString = chalk.red('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Success:
        printString = chalk.green('[' + sender + '] ' + message);
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
