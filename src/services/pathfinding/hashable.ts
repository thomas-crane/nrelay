/**
 * An object which can generate a unique hash code.
 */
export interface Hashable {
  /**
   * Returns the hash code of the object.
   */
  hash(): string;
}
