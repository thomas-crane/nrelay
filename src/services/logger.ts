import * as chalk from 'chalk';

export function Log(sender: string, message: string, level: SeverityLevel = SeverityLevel.Message): void {
    let printString: string;
    switch (level) {
        case SeverityLevel.Info:
        printString = chalk.default.gray('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Message:
        printString = ('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Warning:
        printString = chalk.default.yellow('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Error:
        printString = chalk.default.red('[' + sender + '] ' + message);
        break;
        case SeverityLevel.Success:
        printString = chalk.default.green('[' + sender + '] ' + message);
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
