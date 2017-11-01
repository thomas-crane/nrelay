import { PacketType } from './../networking/packet';
import { Log, SeverityLevel } from './../services/logger';
import { PluginManager } from './../core/plugin-manager';

export function NrPlugin(info: { name: string, author: string, description?: string }): (target: object) => void {
    PluginManager.addPluginInfo(info);
    return (target: object) => { };
}
