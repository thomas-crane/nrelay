/**
 * A description of a library.
 */
export interface LibraryInfo {
  /**
   * The name of the library.
   */
  name: string;
  /**
   * The author of the library.
   */
  author: string;
  /**
   * A description of the library.
   */
  description?: string;
  /**
   * Whether or not the library is enabled. The default is `true`.
   */
  enabled?: boolean;
}
