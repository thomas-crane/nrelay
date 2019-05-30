import { Packet } from '@realmlib/net';
import * as fs from 'fs';
import * as path from 'path';
import { getHooks, getLibs } from '../decorators';
import { Runtime } from '../runtime/runtime';
import { Logger, LogLevel } from './../services';
import { Client } from './client';
import { HookInfo, HookParamType, LoadedLib, ManagedLib } from './lib-info';

const PLUGIN_REGEX = /\.js$/;

/**
 * A static singleton class used to load libraries and packet hooks.
 */
export class LibraryManager {

  readonly libStore: Map<string, ManagedLib<any>> = new Map();
  readonly hookStore: Map<string, Array<HookInfo<any>>> = new Map();
  readonly clientHookStore: Map<string, HookInfo<Client>> = new Map();

  private readonly loadQueue: Map<string, LoadedLib<any>>;

  constructor(readonly runtime: Runtime) {
    this.libStore = new Map();
    this.hookStore = new Map();
    this.clientHookStore = new Map();
    this.loadQueue = new Map();
  }

  /**
   * Loads the client hooks.
   */
  loadClientHooks(): void {
    // load the client hooks.
    const clientHooks = getHooks().filter((hook) => hook.target === 'Client');
    for (const clientHook of clientHooks) {
      this.clientHookStore.set(clientHook.packet, clientHook);
    }
  }

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
    // we use a map here to make dependency fetching easier later.
    const libs = getLibs();
    for (const lib of libs) {
      if (this.loadQueue.has(lib.target.name)) {
        Logger.log('LibraryManager', `A library with the name ${lib.target.name} already exists.`, LogLevel.Error);
      } else {
        this.loadQueue.set(lib.target.name, lib);
      }
    }

    // load each lib
    for (const [, lib] of this.loadQueue) {
      this.loadLib(lib);
    }
  }

  loadLib(lib: LoadedLib<any>): boolean {
    Logger.log('LibraryManager', `Loading ${lib.target.name}...`, LogLevel.Info);
    // make sure we won't override an existing lib.
    if (this.libStore.has(lib.target.name)) {
      Logger.log('LibraryManager', `A library with the name ${lib.target.name} already exists.`, LogLevel.Error);
      return false;
    }

    // don't load it if it's disabled.
    if (lib.info.enabled === false) {
      Logger.log('LibraryManager', `Skipping disabled plugin: ${lib.info.name}`, LogLevel.Debug);
      return false;
    }

    // get all of the dependencies.
    const dependencies: any[] = [];
    for (const dep of lib.dependencies) {
      // check if the dependency is the runtime.
      if (dep === 'Runtime') {
        dependencies.push(this.runtime);
        continue;
      }
      // if the dependency is loaded, we're good to go.
      if (this.libStore.has(dep)) {
        dependencies.push(this.libStore.get(dep).instance);
      } else {
        // get the dependency.
        const depInfo = getLibs().filter((loadedLib) => loadedLib.target.name === dep)[0];
        // the dependency might not exist.
        if (!depInfo) {
          Logger.log('LibraryManager', `${lib.target.name} depends on the unloaded library ${dep}.`, LogLevel.Error);
          return false;
        } else {
          // load the dependency
          const depLoaded = this.loadLib(depInfo);
          if (!depLoaded) {
            // if the dependency was not loaded, we can't load this lib.
            // an error was already reported, so no need here.
            return false;
          } else {
            dependencies.push(this.libStore.get(dep).instance);
          }
        }
      }
    }
    // we can now create an instance.
    try {
      // instantiate the plugin
      const instance = new lib.target(...dependencies);

      // save it
      this.libStore.set(lib.target.name, {
        info: lib,
        instance,
      });
    } catch (error) {
      Logger.log('LibraryManager', `Error while instantiating ${lib.target.name}`, LogLevel.Error);
      Logger.log('LibraryManager', error.message, LogLevel.Error);
      return false;
    }

    // load the hooks
    const libHooks = getHooks().filter((hook) => hook.target === lib.target.name);
    for (const hook of libHooks) {
      if (!this.hookStore.has(hook.packet)) {
        this.hookStore.set(hook.packet, []);
      }
      this.hookStore.get(hook.packet).push(hook);
    }

    Logger.log('LibraryManager', `Loaded ${lib.info.name} by ${lib.info.author}!`, LogLevel.Success);
    // remove this lib from the queue if it's in there.
    if (this.loadQueue.has(lib.target.name)) {
      this.loadQueue.delete(lib.target.name);
    }
    return true;
  }

  /**
   * Invokes any packet hook methods which are registered for the given packet type.
   */
  callHooks(packet: Packet, client: Client): void {
    if (this.hookStore.has(packet.type)) {
      // get the hooks for this packet type.
      const hooks = this.hookStore.get(packet.type);
      for (const hook of hooks) {
        if (!packet.propagate) {
          return;
        }
        try {
          // find the plugin instance to call the method on.
          const caller = this.libStore.get(hook.target);
          if (caller && caller.instance) {
            // create the args according to the hook's signature.
            const args = hook.signature.map((argType) => {
              switch (argType) {
                case HookParamType.Packet:
                  return packet;
                case HookParamType.Client:
                  return client;
                default:
                  return undefined;
              }
            });
            caller.instance[hook.method].apply(caller.instance, args);
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
    if (this.clientHookStore.has(packet.type)) {
      const hook = this.clientHookStore.get(packet.type);
      // create the args according to the hook's signature.
      const args = hook.signature.map((argType) => {
        switch (argType) {
          case HookParamType.Packet:
            return packet;
          case HookParamType.Client:
            return client;
          default:
            return undefined;
        }
      });
      (client as any)[hook.method].apply(client, args);
    }
  }
}
