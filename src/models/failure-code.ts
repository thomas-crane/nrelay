/**
 * The error codes of errors which can be received in the `FailurePacket`.
 */
export enum FailureCode {
  /**
   * Received when the `buildVersion` sent in the `HelloPacket` is not the current one.
   */
  IncorrectVersion = 4,
  /**
   * Received when an incorrect `key` is sent in the `HelloPacket`.
   */
  BadKey = 5,
  /**
   * Received when the target of a `TeleportPacket` was not a valid target.
   */
  InvalidTeleportTarget = 6,
  /**
   * Received when the account that has connected does not have a verified email.
   */
  EmailVerificationNeeded = 7,
  /**
   * > Unknown.
   */
  TeleportRealmBlock = 9,
}
