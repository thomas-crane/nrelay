import { PacketType } from './../networking/packet';
import { Log, LogLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';
import { Client } from './../core/client';

export function HookPacket(type: PacketType):
    (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {
        const originalMethod = descriptor.value;
        PluginManager.addHook(type, originalMethod, target.constructor.name);
    };
}
