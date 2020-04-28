/**
 * The endpoint used to retreive the list of servers and the character information about an account.
 */
export const SERVER_ENDPOINT = 'https://realmofthemadgodhrd.appspot.com/char/list';
/**
 * The endpoint used to retreive the latest resources.
 */
export const ASSET_ENDPOINT = 'https://static.drips.pw/rotmg/production';
/**
 * The endpoint used to retreive file contents from the main nrelay repository.
 */
export const GITHUB_CONTENT_ENDPOINT = 'https://api.github.com/repos/thomas-crane/nrelay/contents';

/**
 * The endpoint used to check the version of the latest client.
 */
export const CLIENT_VERSION_ENDPOINT = 'https://www.realmofthemadgod.com/version.txt';

/**
 * The endpoint used to retrieve the latest client.
 * `{{version}}` needs to be replaced with the current version before use.
 * @example
 * const downloadPath = CLIENT_DL_ENDPOINT.replace('{{version}}', currentVersion);
 */
export const CLIENT_DL_ENDPOINT = 'https://www.realmofthemadgod.com/AssembleeGameClient{{version}}.swf';
