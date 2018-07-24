import 'reflect-metadata';
import { PluginManager } from './../core/plugin-manager';
import { LibraryInfo } from './../models/plugin-info';

/**
 * Indicates that the decorated class is a Library which may contain packet hooks.
 * @param libInfo The library information.
 */
export function Library(libInfo: LibraryInfo): ClassDecorator {
  return (target: any) => {
    const params = Reflect.getMetadata('design:paramtypes', target) || [];
    const dependencies = params.map((type: any) => type.name);
    PluginManager.loadLibrary({
      info: libInfo,
      target,
      dependencies
    });
  };
}
