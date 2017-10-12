import { Packet } from './packet';
import stream = require('stream');
import { RC4, OUTGOING_KEY } from './../crypto/rc4';

export class PacketIO {

    private sendRC4: RC4;

    constructor() {
        this.sendRC4 = new RC4(OUTGOING_KEY);
    }

    sendPacket(packet: Packet): Buffer {
        packet.reset();
        packet.write();
        let packetSize = packet.data.length;
        const encryptedPacket = this.sendRC4.cipher(packet.data);
        packetSize += 5;
        packet.data = Buffer.concat([Buffer.alloc(5), encryptedPacket], packetSize);

        packet.bufferIndex = 0;
        packet.writeInt32(packetSize);
        packet.writeByte(packet.id);

        return packet.data;
    }
}
