/**
 * @module models
 */
/**
 * Configuration settings for a proxy.
 */
export interface Proxy {
  /**
   * The host address of the proxy. Prefer using an IP over a hostname.
   */
  host: string;
  /**
   * The port of the proxy.
   */
  port: number;
  /**
   * The username for the proxy, if one is required.
   */
  userId?: string;
  /**
   * The password for the proxy, if one is required.
   */
  password?: string;
  /**
   * The type of proxy. Either `4` for SOCKSv4 and SOCKSv4a, or `5` for SOCKSv5.
   */
  type: 4 | 5;
}
