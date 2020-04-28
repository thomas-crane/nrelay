/**
 * The name given to all `AccountInUseError`s.
 */
export const ACCOUNT_IN_USE = 'ACCOUNT_IN_USE';

/**
 * An account in use error. This is a simple subclass
 * of the `Error` class which includes a timeout property.
 */
export class AccountInUseError extends Error {
  timeout: number;

  get name(): string {
    return ACCOUNT_IN_USE;
  }

  constructor(timeout: number) {
    super(`Account in use. ${timeout} seconds until timeout.`);
    this.timeout = timeout;
  }
}
