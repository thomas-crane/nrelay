import { Packet } from './../networking/packet';
import { Log, LogLevel, Storage } from './../services';
import { Client } from './client';
import { environment } from './../models';
import * as fs from 'fs';
import { ILoadedLib, IManagedLib, IHookInfo } from './lib-info';

const PLUGIN_REGEX = /^.+\.js$/;

export class PluginManager {

    static readonly libStore: Map<string, IManagedLib<any>> = new Map();
    static readonly hookStore: Map<string, Array<IHookInfo<any>>> = new Map();
    static readonly clientHookStore: Map<string, IHookInfo<Client>> = new Map();

    static loadPlugins(): void {
        const folderPath = Storage.makePath('dist', 'plugins');
        let files: string[] = [];
        try {
            files = fs.readdirSync(folderPath);
        } catch {
            Log('PluginManager', 'Couldn\'t find plugins directory', LogLevel.Warning);
        }
        for (const file of files) {
            try {
                const relPath = Storage.makePath('dist', 'plugins', file);
                if (!PLUGIN_REGEX.test(relPath)) {
                    if (environment.debug) {
                        Log('PluginManager', `Skipping ${relPath}`, LogLevel.Info);
                    }
                    continue;
                }
                require(relPath);
            } catch (err) {
                Log('PluginManager', `Error while loading ${file}`, LogLevel.Warning);
                console.error(err);
            }
        }
        if (this.afterInitFunctions && this.afterInitFunctions.length > 0) {
            for (const func of this.afterInitFunctions) {
                func();
            }
            this.afterInitFunctions = null;
        }
    }

    static loadHook<T>(info: IHookInfo<T>): void {
        if (info.target === 'Client') {
            this.clientHookStore.set(info.packet, info as any);
        } else {
            if (!this.hookStore.has(info.packet)) {
                this.hookStore.set(info.packet, []);
            }
            this.hookStore.get(info.packet).push(info);
        }
    }

    static loadLibrary<T>(lib: ILoadedLib<T>): void {
        if (this.libStore.has(lib.target.name)) {
            const existing = this.libStore.get(lib.target.name);
            if (existing.info.dependencies.some((v, i) => v !== lib.dependencies[i])) {
                Log('PluginManager', `A library with the name ${lib.target.name} already exists.`, LogLevel.Error);
            } else {
                Log('PluginManager', `The library ${lib.target.name} has already been loaded.`, LogLevel.Warning);
            }
            return;
        }
        if (lib.info.enabled === false) {
            // unload hooks
            for (const store of this.hookStore) {
                this.hookStore.set(store[0], store[1].filter((info) => info.target === lib.info.name));
            }
            return;
        }
        for (const dep of lib.dependencies) {
            if (!this.libStore.has(dep)) {
                const error = new Error(`${lib.target.name} depends on the unloaded library ${dep}.`);
                error.name = '__DEP';
                throw error;
            }
        }
        try {
            const deps = lib.dependencies.map((dep) => this.libStore.get(dep).instance);
            const instance = new lib.target(...deps);
            this.libStore.set(lib.target.name, {
                info: lib,
                instance
            });
            Log('PluginManager', `Loaded ${lib.info.name} by ${lib.info.author}`, LogLevel.Info);
        } catch (error) {
            Log('PluginManager', `Error while instantiating ${lib.target.name}`, LogLevel.Error);
            Log('PluginManager', error.message, LogLevel.Error);
        }
    }

    /**
     * @deprecated Use dependency injection instead.
     */
    static getInstanceOf<T extends object>(instance: new () => T): T {
        Log('Deprecation', 'getInstanceOf is deprecated. Use dependency injection instead.', LogLevel.Warning);
        const lib = this.libStore.get(instance.name);
        if (lib && lib.instance) {
            return lib.instance;
        } else {
            return null;
        }
    }

    static afterInit(method: () => void): void {
        if (!this.afterInitFunctions) {
            this.afterInitFunctions = [];
        }
        this.afterInitFunctions.push(method);
    }

    static callHooks(packet: Packet, client: Client): void {
        const name = packet.constructor.name;
        if (this.hookStore.has(name)) {
            const hooks = this.hookStore.get(name);
            for (const hook of hooks) {
                try {
                    const caller = this.libStore.get(hook.target);
                    if (caller && caller.instance) {
                        caller.instance[hook.method].call(caller.instance, client, packet);
                    }
                } catch (error) {
                    Log('PluginManager', `Error while calling ${hook.target}.${hook.method}()`, LogLevel.Warning);
                    Log('PluginManager', error.message, LogLevel.Warning);
                }
            }
        }
        if (!packet.send) {
            return;
        }
        if (this.clientHookStore.has(name)) {
            const hook = this.clientHookStore.get(name);
            (client as any)[hook.method].call(client, client, packet);
        }
    }

    private static afterInitFunctions: Array<() => void>;
}
