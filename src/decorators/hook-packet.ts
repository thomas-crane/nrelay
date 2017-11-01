import { PacketType } from './../networking/packet';
import { Log, SeverityLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';

export function HookPacket(type: PacketType): (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {
        const originalMethod = descriptor.value;
        Log('Hooks', 'Hooking packet type: ' + type, SeverityLevel.Info);
        PluginManager.addHook(type, originalMethod);
    };
}
