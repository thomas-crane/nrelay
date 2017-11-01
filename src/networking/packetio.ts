import events = require('events');
import net = require('net');
import { Packet } from './packet';
import { Packets } from './packets';
import stream = require('stream');
import { RC4, OUTGOING_KEY, INCOMING_KEY } from './../crypto/rc4';
import { Log, SeverityLevel } from './../services/logger';
import { environment } from './../models/environment';

export class PacketIO {

    private sendRC4: RC4;
    private receiveRC4: RC4;
    private socket: net.Socket;
    private emitter: events.EventEmitter;

    private bytesToRead: number;
    private dataQueue: Buffer;

    constructor(socket: net.Socket) {
        this.bytesToRead = 0;
        this.emitter = new events.EventEmitter();
        this.socket = socket;
        this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
        this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));

        socket.on('data', this.processData.bind(this));
    }

    public on(event: string | symbol, listener: (...args: any[]) => void): events.EventEmitter {
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
            Log('PacketIO', 'WRITE: id: ' + packet.type + ', size: ' + packetSize, SeverityLevel.Info);
        }

        this.socket.write(packet.data);
    }

    private processData(data: Buffer): void {
        if (this.bytesToRead > 0) {
            if (data.length < this.bytesToRead) {
                this.dataQueue = Buffer.concat([this.dataQueue, data], this.dataQueue.length + data.length);
                this.bytesToRead -= data.length;
                return;
            } else {
                this.dataQueue = Buffer.concat([this.dataQueue, data.slice(0, this.bytesToRead)], this.dataQueue.length + this.bytesToRead);
                this.dispatchPacket(this.dataQueue);
                this.dataQueue = Buffer.alloc(0);

                if (this.bytesToRead === data.length) {
                    this.bytesToRead = 0;
                    return;
                } else {
                    data = data.slice(this.bytesToRead, data.length);
                }
                this.bytesToRead = 0;
            }
        }

        let packetSize: number;
        let packetId: number;
        try {
            packetSize = data.readInt32BE(0);
            packetId = data.readInt8(4);
        } catch (err) {
            Log('PacketIO', 'Couldn\'t read packet size/id.', SeverityLevel.Error);
            return;
        }
        if (packetSize === data.length) {
            this.dispatchPacket(data);
            return;
        }
        if (packetSize < data.length) {
            this.dispatchPacket(data.slice(0, packetSize));
            this.processData(data.slice(packetSize, data.length));
            return;
        }
        if (packetSize > data.length) {
            this.bytesToRead = packetSize;
            this.dataQueue = Buffer.from(data);
            this.bytesToRead -= data.length;
            return;
        }
    }

    private dispatchPacket(data: Buffer): void {
        let packetSize: number;
        let packetId: number;
        try {
            packetSize = data.readInt32BE(0);
            packetId = data.readInt8(4);
        } catch (err) {
            Log('PacketIO', 'Couldn\'t read packet size/id.', SeverityLevel.Error);
            return;
        }

        const packetData = data.slice(5, data.length);
        this.receiveRC4.cipher(packetData);

        if (environment.debug) {
            Log('PacketIO', 'READ: id: ' + packetId + ', size: ' + packetSize, SeverityLevel.Info);
        }

        let packet;
        try {
            packet = Packets.create(packetId, packetSize - 5);
            packet.data = packetData;
            packet.bufferIndex = 0;
        } catch (error) {
            if (environment.debug) {
                Log('PacketIO', error.message, SeverityLevel.Error);
            }
        }

        if (packet) {
            packet.read();
            this.emitter.emit('packet', packet);
        }
    }
}
