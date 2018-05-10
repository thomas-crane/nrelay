import { createServer, Server, Socket } from 'net';
import { Log, LogLevel } from './logger';
import { SocketWrapper, environment } from '../models';
import { EventEmitter } from 'events';

export class LocalServer {

    /**
     * Initializes the Local Server and begins listening on the specified port.
     * @param port The port to listen for connections on.
     */
    public static init(port: number): void {
        if (this.initialized) {
            Log('Local Server', 'Local Server has already been initialized.', LogLevel.Warning);
            return;
        }
        this.initialized = true;
        this.sockets = [];
        this.emitter = new EventEmitter();
        Log('Local Server', 'Initializing local server.', LogLevel.Info);
        this.server = createServer(this.onConnection.bind(this));
        this.server.on('error', (err) => {
            Log('Local Server', err.message, LogLevel.Error);
        });
        this.server.on('close', () => {
            Log('Local Server', 'Local Server closed.', LogLevel.Warning);
        });
        this.server.on('listening', () => {
            Log('Local Server', `Local Server is now listening on port ${port}!`, LogLevel.Success);
        });
        this.server.listen(port);
    }

    /**
     * Writes data to all connected sockets. If `message` is not a buffer,
     * it will be converted to a buffer using `utf8` encoding. If it is
     * a buffer, it will not be affected.
     * @param message The message to send.
     */
    public static write(message: string | Buffer): void {
        if (!this.sockets) {
            return;
        }
        let buffer: Buffer;
        if (!Buffer.isBuffer(message)) {
            buffer = Buffer.from(message, 'utf8');
        } else {
            buffer = message;
        }
        buffer = Buffer.concat([Buffer.alloc(4), buffer], buffer.length + 4);
        buffer.writeInt32LE(buffer.length - 4, 0);
        for (const wrapper of this.sockets) {
            if (wrapper.socket.writable) {
                wrapper.socket.write(buffer);
            }
        }
        buffer = null;
    }

    /**
     * Attaches an event listener to the Local Server.
     * @param event The name of the event to listen for. Available events are 'message'.
     * @param listener The callback to invoke when the event is fired.
     */
    public static on(event: 'message', listener: (message: string) => void): EventEmitter {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        return this.emitter.on(event, listener);
    }
    private static emitter: EventEmitter;

    private static socketIdCounter = 0;
    private static sockets: SocketWrapper[];
    private static server: Server;
    private static initialized = false;
    private static onConnection(socket: Socket): void {
        const wrapper = new SocketWrapper(this.getNextSocketId(), socket);
        this.sockets.push(wrapper);
        Log('Local Server', 'Socket connected!', LogLevel.Success);
        wrapper.socket.on('close', (hadError) => {
            Log('Local Server', 'Socket disconnected.', LogLevel.Warning);
            this.sockets.splice(this.sockets.findIndex((s) => s.id === wrapper.id), 1);
            wrapper.destroy();
        });
        wrapper.socket.on('data', (data) => {
            this.emitter.emit('message', (data.toString('utf8')));
        });
        wrapper.socket.on('error', (error) => {
            if (environment.debug) {
                Log('Local Server', `Received socket error: ${error.message}`, LogLevel.Error);
            }
        });
    }

    private static getNextSocketId(): number {
        return this.socketIdCounter++;
    }
}
