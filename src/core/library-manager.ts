/**
 * @module core
 */
import * as fs from 'fs';
import * as path from 'path';
import { getHooks, getLibs } from '../decorators';
import { IncomingPacket } from '../networking';
import { Runtime } from '../runtime/runtime';
import { Logger, LogLevel } from './../services';
import { Client } from './client';
import { HookInfo, ManagedLib } from './lib-info';

const PLUGIN_REGEX = /^.+\.js$/;

/**
 * A static singleton class used to load libraries and packet hooks.
 */
export class LibraryManager {

  readonly libStore: Map<string, ManagedLib<any>> = new Map();
  readonly hookStore: Map<string, Array<HookInfo<any>>> = new Map();
  readonly clientHookStore: Map<string, HookInfo<Client>> = new Map();

  constructor(readonly runtime: Runtime) { }

  /**
   * Loads and stores all libraries present in the `plugins` folder.
   */
  loadPlugins(pluginFolder: string): void {
    Logger.log('LibraryManager', 'Loading plugins...', LogLevel.Info);
    let files: string[] = [];
    try {
      files = fs.readdirSync(this.runtime.env.pathTo(pluginFolder));
    } catch (err) {
      if (err.code === 'ENOENT') {
        Logger.log('LibraryManager', `The directory '${pluginFolder}' does not exist.`, LogLevel.Error);
      } else {
        Logger.log('LibraryManager', `Error while reading plugin directory.`, LogLevel.Error);
        Logger.log('LibraryManager', err.message, LogLevel.Error);
      }
      return;
    }
    for (const file of files) {
      try {
        const relPath = path.join(this.runtime.env.pathTo(pluginFolder, file));
        if (!PLUGIN_REGEX.test(relPath)) {
          Logger.log('LibraryManager', `Skipping ${relPath}`, LogLevel.Debug);
          continue;
        }
        require(relPath);
      } catch (err) {
        Logger.log('LibraryManager', `Error while loading ${file}`, LogLevel.Error);
        Logger.log('LibraryManager', err.message, LogLevel.Error);
      }
    }
    // load the libraries and hooks.
    const libs = getLibs();
    const hooks = getHooks();
    for (const lib of libs) {
      Logger.log('LibraryManager', `Loading ${lib.target.name}...`, LogLevel.Info);
      // make sure we won't override an existing lib.
      if (this.libStore.has(lib.target.name)) {
        Logger.log('LibraryManager', `A library with the name ${lib.target.name} already exists.`, LogLevel.Error);
        continue;
      }
      // don't load it if it's disabled.
      if (lib.info.enabled === false) {
        Logger.log('LibraryManager', `Skipping disabled plugin: ${lib.info.name}`, LogLevel.Debug);
        continue;
      }

      // make sure we actually have all of the dependencies.
      let hasAllDeps = true;
      for (const dep of lib.dependencies) {
        if (!this.libStore.has(dep)) {
          Logger.log('LibraryManager', `${lib.target.name} depends on the unloaded library ${dep}.`, LogLevel.Error);
          hasAllDeps = false;
        }
      }
      if (!hasAllDeps) {
        Logger.log(
          'LibraryManager',
          `${lib.target.name} is missing some dependencies and will not be loaded.`,
          LogLevel.Error,
        );
        continue;
      }

      try {
        // instantiate the plugin
        const deps = lib.dependencies.map((dep) => this.libStore.get(dep).instance);
        const instance = new lib.target(...deps);
        // set its runtime property.
        instance.runtime = this.runtime;

        // save it
        this.libStore.set(lib.target.name, {
          info: lib,
          instance,
        });
      } catch (error) {
        Logger.log('LibraryManager', `Error while instantiating ${lib.target.name}`, LogLevel.Error);
        Logger.log('LibraryManager', error.message, LogLevel.Error);
        continue;
      }

      // load the hooks
      const libHooks = hooks.filter((hook) => hook.target === lib.target.name);
      this.hookStore.set(lib.target.name, libHooks);
      Logger.log('LibraryManager', `Loaded ${lib.info.name} by ${lib.info.author}!`, LogLevel.Success);
    }

    // load the client hooks.
    const clientHooks = hooks.filter((hook) => hook.target === 'Client');
    for (const clientHook of clientHooks) {
      this.clientHookStore.set(clientHook.packet, clientHook);
    }
  }

  /**
   * Invokes any packet hook methods which are registered for the given packet type.
   */
  callHooks(packet: IncomingPacket, client: Client): void {
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
          Logger.log('LibraryManager', `Error while calling ${hook.target}.${hook.method}()`, LogLevel.Warning);
          Logger.log('LibraryManager', error.message, LogLevel.Warning);
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
}
