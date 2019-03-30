/**
 * @module decorators
 */
import 'reflect-metadata';
import { HookInfo } from '../core';
import { Logger, LogLevel } from '../services';
import { VALID_PACKET_HOOKS } from './valid-packets';

const hooks: Array<HookInfo<any>> = [];

/**
 * Indicates that the decorated method should be called when it's packet type is received by a client.
 */
export function PacketHook(): MethodDecorator {
  return (target, key) => {
    const params = (Reflect.getMetadata('design:paramtypes', target, key) || [])
      .map((param: any) => param.name);
    if (params.length < 2) {
      Logger.log('PacketHook', `${getDescription(target, key, params)} requires two parameters.`, LogLevel.Error);
    } else if (params.length > 2) {
      Logger.log('PacketHook', `${getDescription(target, key, params)} only requires 2 parameters.`, LogLevel.Warning);
    }
    if (params[0] !== 'Client') {
      Logger.log(
        'PacketHook',
        `${getDescription(target, key, params)} requires a Client as the first parameter`,
        LogLevel.Error,
      );
      return;
    }
    if (VALID_PACKET_HOOKS.indexOf(params[1]) === -1) {
      Logger.log('PacketHook', `${getDescription(target, key, params)} will never be called.`, LogLevel.Error);
      return;
    }
    hooks.push({
      target: target.constructor.name,
      method: key.toString(),
      packet: params[1],
    });
  };
}

/**
 * Returns a copy of the hooks which have been loaded.
 */
export function getHooks(): Array<HookInfo<any>> {
  return [...hooks];
}

function getDescription(target: object, key: string | symbol, params: string[]): string {
  let printedParams = params;
  if (params.length > 2) {
    printedParams = [...params.slice(0, 2), '...'];
  }
  return `${target.constructor.name}.${key.toString()}(${printedParams.join(', ')})`;
}
