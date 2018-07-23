import { ILibraryInfo } from './../models/plugin-info';

export interface IType<T> {
    new(...args: any[]): T;
}

export interface ILoadedLib<T> {
    info: ILibraryInfo;
    target: IType<T>;
    dependencies: string[];
}

export interface IManagedLib<T> {
    instance: T;
    info: ILoadedLib<T>;
}

export interface IHookInfo<T> {
    target: string;
    method: string;
    packet: string;
}
