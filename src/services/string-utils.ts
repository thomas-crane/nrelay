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
}
