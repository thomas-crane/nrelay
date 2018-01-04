import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from './packet';
import { Packets } from './packets';
import stream = require('stream');
import { RC4, OUTGOING_KEY, INCOMING_KEY } from './../crypto/rc4';
import { Log, LogLevel } from './../services/logger';
import { environment } from './../models/environment';
import { PacketHead } from './packet-head';

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

    public reset(socket: Socket): void {
        this.socket.removeAllListeners('data');
        this.socket = socket;
        this.resetBuffer();
        this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
        this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));

        socket.on('data', this.processData.bind(this));
    }

    public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        return this.emitter.on(event, listener);
    }

    public sendPacket(packet: Packet): void {
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
            Log('PacketIO', 'WRITE: id: ' + packet.type + ', size: ' + packetSize, LogLevel.Info);
        }

        this.socket.write(packet.data);
        packet = null;
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
                Log('PacketIO', 'READ: id: ' + packetId + ', size: ' + packetSize, LogLevel.Error);
            }
            this.emitter.emit('error', err);
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
                    this.emitPacket();
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
                this.emitPacket();
            }
        }
    }

    private emitPacket(): void {
        const packetData = this.packetBuffer.slice(5);
        this.receiveRC4.cipher(packetData);

        if (environment.debug) {
            Log('PacketIO', 'READ: id: ' + this.currentHead.id + ', size: ' + this.currentHead.length, LogLevel.Info);
        }

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
            packet.read();
            packet.data = null;
            this.emitter.emit('packet', packet);
        }
        this.resetBuffer();
    }

    private resetBuffer(): void {
        this.packetBuffer = Buffer.alloc(5);
        this.index = 0;
        this.currentHead = null;
    }
}
