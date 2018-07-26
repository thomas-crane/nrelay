/**
 * @module models
 */
import { Socket } from 'net';

/**
 * A wrapper for a `Socket` to provide a unique identifer for the socket.
 */
export class SocketWrapper {
  /**
   * The unique identifier of this socket.
   */
  id: number;
  /**
   * The socket which this is wrapping.
   */
  socket: Socket;

  /**
   * Creates a new socket wrapper with the given `id` and `socket`.
   * @param id The id of the socket.
   * @param socket The socket to wrap.
   */
  constructor(id: number, socket: Socket) {
    this.id = id;
    this.socket = socket;
  }

  /**
   * Removes any event listeners attached to the socket and destroys it.
   */
  destroy(): void {
    this.socket.removeAllListeners('close');
    this.socket.removeAllListeners('connect');
    this.socket.removeAllListeners('data');
    this.socket.removeAllListeners('error');
    this.socket.destroy();
    this.id = null;
    this.socket = null;
  }
}
