import { LibraryInfo } from './../models/plugin-info';

export interface Type<T> {
  new(...args: any[]): T;
}

export interface LoadedLib<T> {
  info: LibraryInfo;
  target: Type<T>;
  dependencies: string[];
}

export interface ManagedLib<T> {
  instance: T;
  info: LoadedLib<T>;
}

export interface HookInfo<T> {
  target: string;
  method: string;
  packet: string;
}
