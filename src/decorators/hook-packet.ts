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
    const params = Reflect.getMetadata('design:paramtypes', target, key) || [];
    const paramNames = params.map((param: any) => param.name);
    // make sure there are enough parameters.
    if (paramNames.length < 2) {
      Logger.log('PacketHook', `${getDescription(target, key, paramNames)} requires two parameters.`, LogLevel.Error);
    } else if (paramNames.length > 2) {
      Logger.log(
        'PacketHook',
        `${getDescription(target, key, paramNames)} only requires 2 parameters.`,
        LogLevel.Warning,
      );
    }
    // make sure the first parameter is the client.
    if (paramNames[0] !== 'Client') {
      Logger.log(
        'PacketHook',
        `${getDescription(target, key, paramNames)} requires a Client as the first parameter`,
        LogLevel.Error,
      );
      return;
    }
    // make sure the packet hook is hooking an incoming packet.
    if (VALID_PACKET_HOOKS.indexOf(paramNames[1]) === -1) {
      Logger.log('PacketHook', `${getDescription(target, key, paramNames)} will never be called.`, LogLevel.Error);
      return;
    }

    // get the type of the packet.
    const packetInstance = new params[1]();
    const packetType = packetInstance.type;
    // sanity check.
    if (typeof packetType !== 'string') {
      throw new Error(`Cannot get packet type of the packet "${paramNames[1]}"`);
    }
    hooks.push({
      target: target.constructor.name,
      method: key.toString(),
      packet: packetType,
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
