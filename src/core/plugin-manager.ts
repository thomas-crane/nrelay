import { Packet, PacketType } from './../networking/packet';
import { Log, LogLevel } from './../services/logger';
import { Client } from './client';
import { environment } from './../models/environment';
import fs = require('fs');
import { Storage } from '../services/storage';

const PLUGIN_REGEX = /^.+\.js$/;

export class PluginManager {

    static loadPlugins(): void {
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
                        Log('PluginManager', 'Skipping ' + relPath, LogLevel.Info);
                    }
                    continue;
                }
                const pluginClass = require(relPath).default;
                const plugin = new pluginClass();
                const type = (plugin as object).constructor.name;
                if (!this.pluginInstances) {
                    this.pluginInstances = {};
                }
                this.pluginInstances[type] = plugin;
            } catch (err) {
                Log('PluginManager', 'Error while loading ' + files[i], LogLevel.Warning);
                if (environment.debug) {
                    Log('PluginManager', err);
                }
            }
        }
    }

    static addHook(packetType: PacketType, action: typeof Function, target: string): void {
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

    static addPlugin(info: { name: string, author: string, description?: string }): void {
        if (!this.pluginInfo) {
            this.pluginInfo = [];
        }
        Log('PluginManager', 'Loaded ' + info.name + ' by ' + info.author, LogLevel.Info);
        this.pluginInfo.push(info);
    }

    static callHooks(packetType: PacketType, packet: Packet, client: object): void {
        if (!this.hooks) {
            return;
        }
        if (this.hooks[packetType]) {
            for (let i = 0; i < this.hooks[packetType].length; i++) {
                const hook = this.hooks[packetType][i];
                try {
                    let caller: object = client;
                    if (this.pluginInstances && this.pluginInstances[hook.caller]) {
                        caller = this.pluginInstances[hook.caller];
                    }
                    hook.action.apply(caller, [client, packet]);
                } catch (error) {
                    Log('PluginManager', 'Error while calling ' + PacketType[packetType] + ' hook on ' + hook.caller, LogLevel.Warning);
                    if (environment.debug) {
                        Log('PluginManager', error, LogLevel.Info);
                    }
                }
            }
        }
    }

    static printPluginInfo(): void {
        if (!this.pluginInfo) {
            return;
        }
        for (let i = 0; i < this.pluginInfo.length; i++) {
            Log('PluginManager', 'Loaded ' + this.pluginInfo[i].name + ' by ' + this.pluginInfo[i].author, LogLevel.Info);
        }
    }

    private static hooks: { [id: number]: Array<{ action: typeof Function, caller: string }> };
    private static pluginInfo: Array<{ name: string, author: string, description?: string }>;
    private static pluginInstances: { [id: string]: object };
}
