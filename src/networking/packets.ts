import { HelloPacket } from './packets/outgoing/hello-packet';
import { MapInfoPacket } from './packets/incoming/mapinfo-packet';
import { LoadPacket } from './packets/outgoing/load-packet';
import { FailurePacket } from './packets/incoming/failure-packet';
import { CreateSuccessPacket } from './packets/incoming/createsuccess-packet';
import { PacketType, Packet } from './packet';

export class Packets {
    public static create(type: PacketType, bufferSize?: number): Packet {
        if (!PacketType[type]) {
            throw new Error('Invalid packet type: ' + type);
        }
        let packet: Packet;
        switch (type) {
            case PacketType.Hello:
                packet = new HelloPacket(null, bufferSize);
                break;
            case PacketType.MapInfo:
                packet = new MapInfoPacket(null, bufferSize);
                break;
            case PacketType.Load:
                packet = new LoadPacket(null, bufferSize);
                break;
            case PacketType.Failure:
                packet = new FailurePacket(null, bufferSize);
                break;
            case PacketType.CreateSuccess:
                packet = new CreateSuccessPacket(null, bufferSize);
                break;
        }
        packet.type = type;
        return packet;
    }
}
