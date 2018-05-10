import { Packet, PacketType } from './../networking/packet';
import { Log, LogLevel, Storage } from './../services';
import { Client } from './client';
import { environment, IPluginInfo } from './../models';
import fs = require('fs');

const PLUGIN_REGEX = /^.+\.js$/;

export class PluginManager {

    static loadPlugins(): void {
        this.pluginInfo = [];
        this.pluginInstances = {};
        const folderPath = Storage.makePath('dist', 'plugins');
        let files: string[] = [];
        try {
            files = fs.readdirSync(folderPath);
        } catch {
            Log('PluginManager', 'Couldn\'t find plugins directory', LogLevel.Warning);
        }
        for (let i = 0; i < files.length; i++) {
            try {
                const relPath = Storage.makePath('dist', 'plugins', files[i]);
                if (!PLUGIN_REGEX.test(relPath)) {
                    if (environment.debug) {
                        Log('PluginManager', `Skipping ${relPath}`, LogLevel.Info);
                    }
                    continue;
                }
                const pluginClass = require(relPath).default;
            } catch (err) {
                Log('PluginManager', `Error while loading ${files[i]}`, LogLevel.Warning);
                if (environment.debug) {
                    Log('PluginManager', err);
                }
            }
        }
        if (this.afterInitFunctions && this.afterInitFunctions.length > 0) {
            for (let i = 0; i < this.afterInitFunctions.length; i++) {
                this.afterInitFunctions[i]();
            }
            this.afterInitFunctions = null;
        }
    }

    static addHook(packetType: PacketType, action: (client: Client, packet: Packet) => void, target: string): void {
        if (target === 'Client') {
            if (!this.clientHooks) {
                this.clientHooks = {};
            }
            if (!this.clientHooks.hasOwnProperty(packetType)) {
                this.clientHooks[packetType] = [];
            }
            this.clientHooks[packetType].push({
                action: action
            });
        } else {
            if (!this.hooks) {
                this.hooks = {};
            }
            if (!this.hooks.hasOwnProperty(packetType)) {
                this.hooks[packetType] = [];
            }
            this.hooks[packetType].push({
                action: action,
                caller: target
            });
        }
    }

    static addPlugin(info: IPluginInfo, target: new () => object): void {
        // if the plugin is disabled, don't load it.
        if (info.hasOwnProperty('enabled')) {
            if (!info.enabled) {
                if (environment.debug) {
                    Log('PluginManager', `Skipping disabled plugin ${info.name}`, LogLevel.Info);
                }
                // remove hooks
                const hKeys = Object.keys(this.hooks);
                for (let i = 0; i < hKeys.length; i++) {
                    this.hooks[+hKeys[i]] = this.hooks[+hKeys[i]].filter((hook) => {
                        return hook.caller !== target.name;
                    });
                }
                return;
            }
        }
        let plugin: object;
        try {
            plugin = new target();
        } catch (error) {
            Log('PluginManager', `Error while instantiating ${target.name}`, LogLevel.Warning);
            if (environment.debug) {
                Log('PluginManager', error);
            }
            return;
        }
        if (this.pluginInstances.hasOwnProperty(target.name)) {
            Log('PluginManager', `Cannot load ${target.name} because a plugin with the same name already exists.`, LogLevel.Error);
        } else {
            this.pluginInstances[target.name] = plugin;
            this.pluginInfo.push(info);
            Log('PluginManager', `Loaded ${info.name} by ${info.author}`, LogLevel.Info);
        }
    }

    static getInstanceOf<T extends object>(instance: new () => T): T | null {
        if (!this.pluginInstances.hasOwnProperty(instance.name)) {
            return null;
        }
        return this.pluginInstances[instance.name] as T;
    }

    static afterInit(method: () => void): void {
        if (!this.afterInitFunctions) {
            this.afterInitFunctions = [];
        }
        this.afterInitFunctions.push(method);
    }

    static callHooks(packetType: PacketType, packet: Packet, client: Client): void {
        if (this.hooks && this.hooks[packetType]) {
            for (let i = 0; i < this.hooks[packetType].length; i++) {
                const hook = this.hooks[packetType][i];
                try {
                    const caller = this.pluginInstances[hook.caller];
                    hook.action.apply(caller, [client, packet]);
                } catch (error) {
                    Log('PluginManager',
                        `Error while calling ${PacketType[packetType]} hook on ${hook.caller}`, LogLevel.Warning);
                    Log('PluginManager', error, LogLevel.Info);
                }
            }
        }
        if (!packet.send) {
            return;
        }
        if (this.clientHooks && this.clientHooks[packetType]) {
            for (let i = 0; i < this.clientHooks[packetType].length; i++) {
                const hook = this.clientHooks[packetType][i];
                try {
                    hook.action.apply(client, [client, packet]);
                } catch (error) {
                    Log('PluginManager', `Error while calling ${PacketType[packetType]} hook on client.`, LogLevel.Warning);
                    Log('PluginManager', error, LogLevel.Info);
                }
            }
        }
    }

    private static hooks: { [id: number]: Array<{ action: (client: Client, packet: Packet) => void, caller: string }> };
    private static clientHooks: { [id: number]: Array<{ action: (client: Client, packet: Packet) => void }> };
    private static pluginInfo: IPluginInfo[];
    private static pluginInstances: { [name: string]: object };
    private static afterInitFunctions: Array<() => void>;
}
