import { SocksProxy } from 'socks';

export interface IProxy {
    host: string;
    port: number;
    userId?: string;
    password?: string;
    type: 4 | 5;
}
