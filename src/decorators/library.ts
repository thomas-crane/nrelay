import 'reflect-metadata';
import { LibraryManager } from './../core/library-manager';
import { LibraryInfo } from './../models/plugin-info';

/**
 * Indicates that the decorated class is a Library which may contain packet hooks.
 * @param libInfo The library information.
 */
export function Library(libInfo: LibraryInfo): ClassDecorator {
  return (target: any) => {
    const params = Reflect.getMetadata('design:paramtypes', target) || [];
    const dependencies = params.map((type: any) => type.name);
    LibraryManager.loadLibrary({
      info: libInfo,
      target,
      dependencies
    });
  };
}
