export function parse(args: string[]): ArgsResult {
  let result: ArgsResult;
  // single dash args
  const singleDashFlags = args.filter((arg) => arg.charAt(0) === '-' && arg.charAt(1) !== '-');
  result = singleDashFlags.reduce((obj, flag) => {
    obj[flag.substring(1)] = true;
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

export interface ArgsResult {
  args: string[];
  [flag: string]: any;
}
