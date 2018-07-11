import { PacketType } from './../networking/packet';
import { PluginManager } from './../core/plugin-manager';

export function HookPacket(type: PacketType):
    (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {
        const originalMethod = descriptor.value;
        PluginManager.addHook(type, originalMethod, target.constructor.name);
    };
}
