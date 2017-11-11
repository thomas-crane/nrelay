import { PacketType } from './../networking/packet';
import { Log, SeverityLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';
import { Client } from './../core/client';

export function HookPacket(type: PacketType):
(target: typeof Object.prototype, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: typeof Object.prototype, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {
        const originalMethod = descriptor.value;
        PluginManager.addHook(type, originalMethod, target.constructor.name);
    };
}
