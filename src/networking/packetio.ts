import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from './packet';
import { Packets } from './packets';
import stream = require('stream');
import { RC4, OUTGOING_KEY, INCOMING_KEY } from './../crypto/rc4';
import { Log, LogLevel } from './../services/logger';
import { environment } from './../models/environment';
import { PacketHead } from './packet-head';
import { PacketType } from './packet-type';

export class PacketIO {

    private sendRC4: RC4;
    private receiveRC4: RC4;
    private socket: Socket;
    private emitter: EventEmitter;

    private currentHead: PacketHead;
    private packetBuffer: Buffer;
    private index: number;

    constructor(socket: Socket) {
        this.resetBuffer();
        this.emitter = new EventEmitter();
        this.socket = socket;
        this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
        this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));

        socket.on('data', this.processData.bind(this));
    }

    /**
     * Resets the RC4 state and attaches to the new socket.
     * @param socket The socket to attach the PacketIO to.
     */
    public reset(socket: Socket): void {
        this.socket.removeAllListeners('data');
        this.socket = socket;
        this.resetBuffer();
        this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
        this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));

        socket.on('data', this.processData.bind(this));
    }

    /**
     * Attaches an event listener to the PacketIO event emitter.
     * @param event The event to listen for. Current events are `'connect'|'disconnect'`
     * @param listener The function to call when the event is fired.
     * The current method signature is `(playerData: IPlayerData, client: Client)`
     */
    public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        return this.emitter.on(event, listener);
    }

    /**
     * Removes all event listeners and destroys any resources held by the PacketIO.
     * This should only be used when the PacketIO is no longer needed.
     */
    public destroy(): void {
        if (this.socket) {
            this.socket.removeAllListeners('data');
        }
        this.receiveRC4 = null;
        this.sendRC4 = null;
        this.currentHead = null;
        this.packetBuffer = null;
        this.emitter.removeAllListeners('error');
        this.emitter.removeAllListeners('packet');
    }

    /**
     * Sends a packet.
     * @param packet The packet to send.
     */
    public sendPacket(packet: Packet): void {
        if (this.socket.destroyed) {
            return;
        }
        packet.reset();
        packet.write();

        // resize to as small as needed.
        packet.data = packet.data.slice(0, packet.bufferIndex);

        let packetSize = packet.data.length;
        this.sendRC4.cipher(packet.data);
        packetSize += 5;
        packet.data = Buffer.concat([Buffer.alloc(5), packet.data], packetSize);

        packet.bufferIndex = 0;
        packet.writeInt32(packetSize);
        packet.writeByte(packet.type);

        if (environment.debug) {
            Log('PacketIO', `WRITE: id: ${packet.type}, size: ${packetSize}`, LogLevel.Info);
        }

        this.socket.write(packet.data);
        packet = null;
    }

    /**
     * Emits a packet from this PacketIO instance. This will only
     * emit the packet to the clients subscribed to this particular PacketIO.
     * @param packet The packet to emit.
     */
    public emitPacket(packet: Packet): void {
        if (packet) {
            this.emitter.emit('packet', packet);
        }
    }

    private processHead(): void {
        let packetSize: number;
        let packetId: number;
        try {
            packetSize = this.packetBuffer.readInt32BE(0);
            packetId = this.packetBuffer.readInt8(4);
            if (packetSize < 0) {
                throw new Error('Invalid packet size.');
            }
            if (packetId < 0) {
                throw new Error('Invalid packet id.');
            }
        } catch (err) {
            if (environment.debug) {
                Log('PacketIO', `READ: id: ${packetId}, size: ${packetSize}`, LogLevel.Error);
            }
            this.emitter.emit('error', err);
            this.resetBuffer();
            return;
        }
        this.currentHead = new PacketHead(packetId, packetSize);
        this.packetBuffer = Buffer.concat([this.packetBuffer, Buffer.alloc(packetSize - 5)], packetSize);
    }

    private processData(data: Buffer): void {
        // process all data which has arrived.
        for (let i = 0; i < data.length; i++) {
            // reconnecting to the nexus causes a 'buffer' byte to be sent
            // which should be skipped.
            if (this.index === 0 && data[i] === 255) {
                continue;
            }
            if (this.index < this.packetBuffer.length) {
                this.packetBuffer[this.index++] = data[i];
            } else {
                if (!this.currentHead) {
                    this.processHead();
                } else {
                    // packet buffer is full, emit a packet before continuing.
                    const packet = this.constructPacket();
                    this.emitPacket(packet);
                }
                if (this.index === 0 && data[i] === 255) {
                    continue;
                }
                this.packetBuffer[this.index++] = data[i];
            }
        }

        // if the packet buffer is full, emit a packet.
        if (this.index === this.packetBuffer.length) {
            if (!this.currentHead) {
                this.processHead();
            } else {
                // packet buffer is full, emit a packet before continuing.
                const packet = this.constructPacket();
                this.emitPacket(packet);
            }
        }
    }

    private constructPacket(): Packet {
        const packetData = this.packetBuffer.slice(5);
        this.receiveRC4.cipher(packetData);

        let packet;
        try {
            packet = Packets.create(this.currentHead.id, packetData);
            packet.bufferIndex = 0;
        } catch (error) {
            if (environment.debug) {
                Log('PacketIO', error.message, LogLevel.Error);
            }
        }
        if (packet) {
            try {
                packet.read();
            } catch (error) {
                if (environment.debug) {
                    Log('PacketIO', error, LogLevel.Error);
                }
                this.emitter.emit('error', new Error('Invalid packet structure.'));
                Log('PacketIO', `Error while reading ${PacketType[packet.type]}`, LogLevel.Error);
                this.resetBuffer();
                return;
            }
            packet.data = null;
        }
        if (environment.debug) {
            Log('PacketIO', `READ: id: ${this.currentHead.id}, size: ${this.currentHead.length}`, LogLevel.Info);
        }
        this.resetBuffer();
        return packet;
    }

    private resetBuffer(): void {
        this.packetBuffer = Buffer.alloc(5);
        this.index = 0;
        this.currentHead = null;
    }
}
