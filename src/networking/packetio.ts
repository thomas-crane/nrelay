import events = require('events');
import net = require('net');
import { Packet } from './packet';
import { Packets } from './packets';
import stream = require('stream');
import { RC4, OUTGOING_KEY, INCOMING_KEY } from './../crypto/rc4';
import { Log, SeverityLevel } from './../services/logger';

export class PacketIO extends events.EventEmitter {

    private sendRC4: RC4;
    private receiveRC4: RC4;
    private socket: net.Socket;

    constructor(socket: net.Socket) {
        super();
        this.socket = socket;
        this.sendRC4 = new RC4(OUTGOING_KEY);
        this.receiveRC4 = new RC4(INCOMING_KEY);

        socket.on('data', (data: Buffer) => {
            if (data.length < 5) {
                Log('PacketIO', 'Received failure packet.', SeverityLevel.Warning);
                return;
            }
            const packetSize = data.readInt32BE(0);
            const packetId = data.readInt8(4);
            const packetData = this.receiveRC4.decipher(data.slice(5, data.length));

            let packet;
            try {
                packet = Packets.create(packetId, packetSize - 5);
                packet.data = packetData;
            } catch (error) {
                Log('PacketIO', error.message, SeverityLevel.Error);
            }

            if (packet) {
                packet.read();
                this.emit('packet', packet);
            }
        });
    }

    sendPacket(packet: Packet): void {
        packet.reset();
        packet.write();

        // resize to as small as needed.
        packet.data = packet.data.slice(0, packet.bufferIndex);

        let packetSize = packet.data.length;
        const encryptedPacket = this.sendRC4.cipher(packet.data);
        packetSize += 5;
        packet.data = Buffer.concat([Buffer.alloc(5), encryptedPacket], packetSize);

        packet.bufferIndex = 0;
        packet.writeInt32(packetSize);
        packet.writeByte(packet.id);

        this.socket.write(packet.data);
    }
}
