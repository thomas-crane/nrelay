import { Logger, LogLevel, Storage } from './../services';
import { Client } from './client';
import { environment } from './../models';
import * as fs from 'fs';
import { LoadedLib, ManagedLib, HookInfo } from './lib-info';
import { IncomingPacket } from '../networking';

const PLUGIN_REGEX = /^.+\.js$/;

/**
 * A static singleton class used to load libraries and packet hooks.
 */
export class PluginManager {

  static readonly libStore: Map<string, ManagedLib<any>> = new Map();
  static readonly hookStore: Map<string, Array<HookInfo<any>>> = new Map();
  static readonly clientHookStore: Map<string, HookInfo<Client>> = new Map();

  /**
   * Loads and stores all libraries present in the `plugins` folder.
   */
  static loadPlugins(): void {
    const folderPath = Storage.makePath('dist', 'plugins');
    let files: string[] = [];
    try {
      files = fs.readdirSync(folderPath);
    } catch {
      Logger.log('PluginManager', 'Couldn\'t find plugins directory', LogLevel.Warning);
    }
    for (const file of files) {
      try {
        const relPath = Storage.makePath('dist', 'plugins', file);
        if (!PLUGIN_REGEX.test(relPath)) {
          Logger.log('PluginManager', `Skipping ${relPath}`, LogLevel.Debug);
          continue;
        }
        require(relPath);
      } catch (err) {
        Logger.log('PluginManager', `Error while loading ${file}`, LogLevel.Warning);
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

  /**
   * Stores the given `info` about the packet hook.
   * @param info The hook information.
   */
  static loadHook<T>(info: HookInfo<T>): void {
    if (info.target === 'Client') {
      this.clientHookStore.set(info.packet, info as any);
    } else {
      if (!this.hookStore.has(info.packet)) {
        this.hookStore.set(info.packet, []);
      }
      this.hookStore.get(info.packet).push(info);
    }
  }

  /**
   * Creates and stores a `ManagedLib` from the given `lib`.
   * @param lib The library to load.
   */
  static loadLibrary<T>(lib: LoadedLib<T>): void {
    if (this.libStore.has(lib.target.name)) {
      const existing = this.libStore.get(lib.target.name);
      if (existing.info.dependencies.some((v, i) => v !== lib.dependencies[i])) {
        Logger.log('PluginManager', `A library with the name ${lib.target.name} already exists.`, LogLevel.Error);
      } else {
        Logger.log('PluginManager', `The library ${lib.target.name} has already been loaded.`, LogLevel.Warning);
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
      Logger.log('PluginManager', `Loaded ${lib.info.name} by ${lib.info.author}`, LogLevel.Info);
    } catch (error) {
      Logger.log('PluginManager', `Error while instantiating ${lib.target.name}`, LogLevel.Error);
      Logger.log('PluginManager', error.message, LogLevel.Error);
    }
  }

  /**
   * Gets an instance of the specified type from the `libStore`.
   * @deprecated Use dependency injection instead.
   */
  static getInstanceOf<T extends object>(instance: new () => T): T {
    Logger.log('Deprecation', 'getInstanceOf is deprecated. Use dependency injection instead.', LogLevel.Warning);
    const lib = this.libStore.get(instance.name);
    if (lib && lib.instance) {
      return lib.instance;
    } else {
      return null;
    }
  }

  /**
   * Invokes the `method` after all plugins have loaded.
   * @param method The method to invoke.
   * @deprecated `loadPlugins` may be called more than once, therefore
   * it is impossible to tell when "all" plugins have loaded. This method
   * is only guaranteed to work for the *first* call of `loadPlugins`.
   */
  static afterInit(method: () => void): void {
    if (!this.afterInitFunctions) {
      this.afterInitFunctions = [];
    }
    this.afterInitFunctions.push(method);
  }

  /**
   * Invokes any packet hook methods which are registered for the given packet type.
   */
  static callHooks(packet: IncomingPacket, client: Client): void {
    const name = packet.constructor.name;
    if (this.hookStore.has(name)) {
      const hooks = this.hookStore.get(name);
      for (const hook of hooks) {
        if (!packet.propagate) {
          return;
        }
        try {
          const caller = this.libStore.get(hook.target);
          if (caller && caller.instance) {
            caller.instance[hook.method].call(caller.instance, client, packet);
          }
        } catch (error) {
          Logger.log('PluginManager', `Error while calling ${hook.target}.${hook.method}()`, LogLevel.Warning);
          Logger.log('PluginManager', error.message, LogLevel.Warning);
        }
      }
    }
    if (!packet.propagate) {
      return;
    }
    if (this.clientHookStore.has(name)) {
      const hook = this.clientHookStore.get(name);
      (client as any)[hook.method].call(client, client, packet);
    }
  }

  private static afterInitFunctions: Array<() => void>;
}
