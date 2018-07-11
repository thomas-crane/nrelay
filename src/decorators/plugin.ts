import { PluginManager } from './../core/plugin-manager';
import { IPluginInfo } from './../models/plugin-info';

export function NrPlugin(info: IPluginInfo): (target: new () => object) => any {
    return (target: new () => object) => {
        PluginManager.addPlugin(info, target);
        return target;
    };
}
