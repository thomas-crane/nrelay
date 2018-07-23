const EMAIL_REPLACE_REGEX = /.+?(.+?)(?:@|\+\d+).+?(.+?)\./;

export class StringUtils {
  /**
   * Replaces the local part and domain of an email address with asterisks.
   * This is generally used to avoid leaking information through log files.
   * @param guid The guid to censor.
   */
  static censorGuid(guid: string): string {
    const match = EMAIL_REPLACE_REGEX.exec(guid);
    let result = guid;
    if (match) {
      if (match[1]) {
        result = result.replace(match[1], '***');
      }
      if (match[2]) {
        result = result.replace(match[2], '***');
      }
    }
    return result;
  }

  /**
   * Returns a string which is at least `paddingLength` characters long, which
   * contains the original `str` and spaces to fill the remaining space if there is any.
   * @param str The string to pad.
   * @param paddingLength The number of spaces to add.
   */
  static pad(str: string, paddingLength: number): string {
    if (str.length > paddingLength) {
      return str;
    }
    return (str + ' '.repeat(paddingLength - str.length));
  }

  /**
   * Returns the current time in HH:mm:ss format.
   */
  static getTime(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }
}
