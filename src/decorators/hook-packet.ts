import { PacketType } from './../networking/packet';
import { Log, SeverityLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';

export function hookPacket(type: PacketType) {
    return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        const originalMethod = descriptor.value;
        Log('Hooks', 'Hooking packet type: ' + type, SeverityLevel.Info);
        PluginManager.addHook(type, originalMethod);
    }
}
