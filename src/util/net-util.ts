import * as net from 'net';
import { SocksClient } from 'socks';
import { Proxy } from '../models';

/**
 * Creates a connection to the specified host and port, optionally through
 * a provided proxy. Returns a promise which is resolved when the connection
 * has been established.
 * @param host The host to connect to.
 * @param port The port to connect to.
 * @param proxy An optional proxy to use when connecting.
 */
export function createConnection(host: string, port: number, proxy?: Proxy): Promise<net.Socket> {
  if (proxy) {
    return SocksClient.createConnection({
      proxy: {
        ipaddress: proxy.host,
        port: proxy.port,
        type: proxy.type,
        userId: proxy.userId,
        password: proxy.password,
      },
      command: 'connect',
      destination: {
        host,
        port,
      },
    }).then((info) => {
      return info.socket;
    });
  }
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const err = (err: Error) => {
      reject(err);
    };
    socket.addListener('error', err);
    socket.connect(port, host, () => {
      socket.removeListener('error', err);
      process.nextTick(resolve, socket);
    });
  });
}
