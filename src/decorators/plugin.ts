import { PacketType } from './../networking/packet';
import { Log, LogLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';

export function NrPlugin(info: { name: string, author: string, description?: string }): (target: object) => any {
    return (target: object) => {
        PluginManager.addPlugin(info);
        return target;
    };
}
