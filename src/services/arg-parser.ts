/**
 * @module cli
 */
/**
 * Parses command line arguments into an `ArgsResult` object.
 * @param args The arguments to parse.
 */
export function parse(args: string[]): ArgsResult {
  let result: ArgsResult;
  // single dash args
  const singleDashFlags = args.filter((arg) => arg.charAt(0) === '-' && arg.charAt(1) !== '-');
  result = singleDashFlags.reduce((obj, flag) => {
    const flags = flag.substring(1).split('');
    for (const f of flags) {
      obj[f] = true;
    }
    return obj;
  }, {} as ArgsResult);

  // double dash flags
  const doubleDashFlags = args.filter((arg) => arg.charAt(0) === '-' && arg.charAt(1) === '-');
  result = doubleDashFlags.reduce((obj, flag) => {
    if (flag.startsWith('--no-')) {
      obj[flag.substring(5)] = false;
    } else {
      const equalIndex = flag.indexOf('=');
      if (equalIndex !== -1) {
        const key = flag.substring(2, equalIndex);
        const value = flag.substring(equalIndex + 1);
        obj[key] = value;
      } else {
        obj[flag.substring(2)] = true;
      }
    }
    return obj;
  }, result);

  // non-flags
  const nonFlags = args.filter((arg) => !arg.startsWith('-'));
  result.args = nonFlags;
  return result;
}

/**
 * A dictionary-like object containing the result of parsing some command line arguments.
 */
export interface ArgsResult {
  /**
   * An array of arguments which were 'floating' (not part of any flag).
   */
  args: string[];
  /**
   * A dictionary of parsed flags.
   */
  [flag: string]: any;
}
