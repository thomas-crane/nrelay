/**
 * Information about the versions of an nrelay project.
 */
export interface Versions {
  /**
   * The version of the client which the packets were extracted from.
   */
  clientVersion: string;
  /**
   * The version of the assets which are managed by the resource manager.
   */
  assetVersion: string;
  /**
   * The build version used by this project.
   */
  buildVersion: string;
  /**
   * The client token used by this project.
   */
  clientToken: string;
}
