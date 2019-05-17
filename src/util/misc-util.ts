/**
 * Returns a promise which resolves after `ms` milliseconds.
 * @param ms The number of milliseconds to wait.
 */
export function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
