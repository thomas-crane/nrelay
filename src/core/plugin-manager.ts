import { Packet, PacketType } from './../networking/packet';
import { Log, SeverityLevel } from './../services/logger';
import fs = require('fs');
import path = require('path');

export class PluginManager {

    static loadPlugins(): void {
        const segments = __dirname.split(path.sep);
        segments.pop();
        segments.push('plugins');
        let files: string[] = [];
        try {
            files = fs.readdirSync(segments.join(path.sep));
        } catch {
            Log('PluginManager', 'Couldn\'t find plugins directory', SeverityLevel.Warning);
        }
        for (let i = 0; i < files.length; i++) {
            try {
                const relPath = path.join(...segments, files[i]);
                const pluginClass = require(relPath).default;
                const plugin = new pluginClass();
            } catch {
                Log('PluginManager', 'Error while loading ' + files[i], SeverityLevel.Warning);
            }
        }
    }

    static addHook(packetType: PacketType, action: any): void {
        if (!this.hooks) {
            this.hooks = {};
        }
        if (!this.hooks.hasOwnProperty(packetType)) {
            this.hooks[packetType] = [];
        }
        this.hooks[packetType].push(action);
    }

    static addPluginInfo(info: {name: string, author: string, description?: string }): void {
        if (!this.pluginInfo) {
            this.pluginInfo = [];
        }
        this.pluginInfo.push(info);
    }

    static callHooks(packetType: PacketType, packet: Packet, caller: any): void {
        if (!this.hooks) {
            return;
        }
        if (this.hooks.hasOwnProperty(packetType)) {
            for (let i = 0; i < this.hooks[packetType].length; i++) {
                this.hooks[packetType][i].apply(caller, [caller, packet]);
            }
        }
    }

    static printPluginInfo(): void {
        if (!this.pluginInfo) {
            return;
        }
        for (let i = 0; i < this.pluginInfo.length; i++) {
            Log('PluginManager', 'Loaded ' + this.pluginInfo[i].name + ' by ' + this.pluginInfo[i].author, SeverityLevel.Info);
        }
    }

    private static hooks: { [id: number]: any[] };
    private static pluginInfo: Array<{name: string, author: string, description?: string }>;
}
