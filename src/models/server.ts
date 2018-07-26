/**
 * @module models
 */
/**
 * A server which can be connected to.
 */
export interface Server {
  /**
   * The name of the server.
   */
  name: string;
  /**
   * The address of the server. Hostnames are **not** supported.
   */
  address: string;
}
