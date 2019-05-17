import { Logger, LogLevel } from '../core';

const schedules = new Map();
const MIN_TIME = 2000;

/**
 * Generates a suitable amount of time to wait before
 * initiating a connection to ensure the game server
 * is not overloaded. Connecting too quickly can result
 * in connections being rejected.
 * @param host The host to get the wait time for.
 */
export function getWaitTime(host: string): number {
  const now = Date.now();
  let nextTime = schedules.get(host) || 0;
  let timeout = 0;
  if (now < nextTime) {
    // if the connection was too soon, return how many ms there is to go.
    timeout = nextTime - now;
    // add some more delay for the next connection.
    nextTime += MIN_TIME;
  } else {
    // no delay required. Make sure the next connection is at least MIN_TIME ms away.
    nextTime = now + MIN_TIME;
  }
  schedules.set(host, nextTime);
  Logger.log('Scheduler', `Delaying ${host ? host : 'local'} by ${timeout}ms`, LogLevel.Debug);
  return timeout;
}
