/**
 * @module networking
 */
import { EventEmitter } from 'events';
import { Socket } from 'net';
import { PacketBuffer } from './packet-buffer';
import { Packets } from './packets';
import { RC4, OUTGOING_KEY, INCOMING_KEY } from '../crypto';
import { IncomingPacket, OutgoingPacket } from './packet';
import { Mapper } from './mapper';
import { PacketType } from './packet-type';
import { Logger, LogLevel } from '../core';

/**
 * A utility class which implements the RotMG messaging protocol on top of a `Socket`.
 */
export class PacketIO {

  private sendRC4: RC4;
  private receiveRC4: RC4;
  private socket: Socket;
  private emitter: EventEmitter;

  private packetBuffer: PacketBuffer;
  private outgoingBuffer: PacketBuffer;

  /**
   * Creates a new `PacketIO` on top of the given `socket`.
   * @param socket The socket to implement the protocol on top of.
   */
  constructor(socket: Socket) {
    this.resetBuffer();
    this.outgoingBuffer = new PacketBuffer(2048);
    this.emitter = new EventEmitter();
    this.socket = socket;
    this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
    this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));

    socket.on('data', this.processData.bind(this));
    socket.on('close', this.onClose.bind(this));
  }

  /**
   * Attaches an event listener to the PacketIO event emitter.
   * @param event The event to listen for.
   * @param listener The function to call when the event is fired.
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Removes all event listeners and destroys any resources held by the PacketIO.
   * This should only be used when the PacketIO is no longer needed.
   */
  destroy(): void {
    if (this.socket) {
      this.socket.removeListener('data', this.processData.bind(this));
      this.socket.removeListener('close', this.onClose.bind(this));
    }
    this.emitter.removeAllListeners('error');
    this.emitter.removeAllListeners('packet');
    process.nextTick(() => {
      // if data is currently being processed, let it finish.
      this.receiveRC4 = null;
      this.sendRC4 = null;
      this.packetBuffer = null;
    });
  }

  /**
   * Sends a packet.
   * @param packet The packet to send.
   */
  sendPacket(packet: OutgoingPacket): void {
    if (this.socket.destroyed) {
      return;
    }

    this.outgoingBuffer.bufferIndex = 5;
    packet.write(this.outgoingBuffer);

    const packetSize = this.outgoingBuffer.bufferIndex;
    this.sendRC4.cipher(this.outgoingBuffer.data.slice(5, packetSize));

    this.outgoingBuffer.bufferIndex = 0;
    const type = Mapper.reverseMap.get(packet.type);
    this.outgoingBuffer.writeInt32(packetSize);
    this.outgoingBuffer.writeByte(type);

    Logger.log('PacketIO', `WRITE: ${PacketType[packet.type]}, size: ${packetSize}`, LogLevel.Debug);

    this.socket.write(this.outgoingBuffer.data.slice(0, packetSize));
  }

  /**
   * Emits a packet from this PacketIO instance. This will only
   * emit the packet to the clients subscribed to this particular PacketIO.
   * @param packet The packet to emit.
   */
  emitPacket(packet: IncomingPacket): void {
    if (packet) {
      this.emitter.emit('packet', packet);
    }
  }

  private processHead(): void {
    let packetSize: number;
    let packetId: number;
    this.packetBuffer.bufferIndex = 0;
    try {
      packetSize = this.packetBuffer.readInt32();
      packetId = this.packetBuffer.readByte();
      if (packetSize < 0) {
        throw new Error('Invalid packet size.');
      }
      if (packetId < 0) {
        throw new Error('Invalid packet id.');
      }
    } catch (err) {
      Logger.log('PacketIO', `READ: id: ${packetId}, size: ${packetSize}`, LogLevel.Error);
      this.emitter.emit('error', err);
      this.resetBuffer();
      return;
    }
    this.packetBuffer.resizeBuffer(packetSize);
  }

  private onClose(): void {
    this.resetBuffer();
    this.sendRC4 = new RC4(Buffer.from(OUTGOING_KEY, 'hex'));
    this.receiveRC4 = new RC4(Buffer.from(INCOMING_KEY, 'hex'));
  }

  private processData(data: Buffer): void {
    // process all data which has arrived.
    for (const byte of data) {
      // reconnecting to the nexus causes a 'buffer' byte to be sent
      // which should be skipped.
      if (this.packetBuffer.bufferIndex === 0 && byte === 255) {
        continue;
      }
      if (this.packetBuffer.bufferIndex < this.packetBuffer.data.length) {
        this.packetBuffer.data[this.packetBuffer.bufferIndex++] = byte;
      } else {
        if (this.packetBuffer.data.length === 5) {
          this.processHead();
        } else {
          // packet buffer is full, emit a packet before continuing.
          const packet = this.constructPacket();
          this.emitPacket(packet);
        }
        if (this.packetBuffer.bufferIndex === 0 && byte === 255) {
          continue;
        }
        this.packetBuffer.data[this.packetBuffer.bufferIndex++] = byte;
      }
    }

    // if the packet buffer is full, emit a packet.
    if (this.packetBuffer.bufferIndex === this.packetBuffer.data.length) {
      if (this.packetBuffer.data.length === 5) {
        this.processHead();
      } else {
        // packet buffer is full, emit a packet before continuing.
        const packet = this.constructPacket();
        this.emitPacket(packet);
      }
    }
  }

  private constructPacket(): IncomingPacket {
    this.receiveRC4.cipher(this.packetBuffer.data.slice(5));

    let packet: IncomingPacket;
    try {
      const type = Mapper.map.get(this.packetBuffer.data.readInt8(4));
      packet = Packets.create(type);
    } catch (error) {
      Logger.log('PacketIO', error.message, LogLevel.Error);
    }
    if (packet) {
      try {
        this.packetBuffer.bufferIndex = 5;
        packet.read(this.packetBuffer);
      } catch (error) {
        this.emitter.emit('error', new Error('Invalid packet structure.'));
        Logger.log('PacketIO', `Error while reading ${PacketType[packet.type]}`, LogLevel.Error);
        Logger.log('PacketIO', error.message, LogLevel.Error);
        this.resetBuffer();
        return;
      }
      Logger.log('PacketIO', `READ: ${PacketType[packet.type]}, size: ${this.packetBuffer.data.length}`, LogLevel.Debug);
    }
    this.resetBuffer();
    return packet;
  }

  private resetBuffer(): void {
    this.packetBuffer = new PacketBuffer(5);
  }
}
