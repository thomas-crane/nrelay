import { Socket } from 'net';

export class SocketWrapper {
    id: number;
    socket: Socket;

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
