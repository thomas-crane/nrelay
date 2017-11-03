import { HelloPacket } from './packets/outgoing/hello-packet';
import { MapInfoPacket } from './packets/incoming/mapinfo-packet';
import { LoadPacket } from './packets/outgoing/load-packet';
import { FailurePacket } from './packets/incoming/failure-packet';
import { CreateSuccessPacket } from './packets/incoming/createsuccess-packet';
import { UpdatePacket } from './packets/incoming/update-packet';
import { UpdateAckPacket } from './packets/outgoing/updateack-packet';
import { AoePacket } from './packets/incoming/aoe-packet';
import { AoeAckPacket } from './packets/outgoing/aoeack-packet';
import { NewTickPacket } from './packets/incoming/newtick-packet';
import { PingPacket } from './packets/incoming/ping-packet';
import { PongPacket } from './packets/outgoing/pong-packet';
import { MovePacket } from './packets/outgoing/move-packet';
import { GotoAckPacket } from './packets/outgoing/gotoack-packet';
import { ShootAckPacket } from './packets/outgoing/shootack-packet';
import { TextPacket } from './packets/incoming/text-packet';
import { PlayerTextPacket } from './packets/outgoing/playertext-packet';
import { CreatePacket } from './packets/outgoing/create-packet';

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
            case PacketType.Update:
                packet = new UpdatePacket(null, bufferSize);
                break;
            case PacketType.UpdateAck:
                packet = new UpdateAckPacket(null, bufferSize);
                break;
            case PacketType.Aoe:
                packet = new AoePacket(null, bufferSize);
                break;
            case PacketType.AoeAck:
                packet = new AoeAckPacket(null, bufferSize);
                break;
            case PacketType.NewTick:
                packet = new NewTickPacket(null, bufferSize);
                break;
            case PacketType.Ping:
                packet = new PingPacket(null, bufferSize);
                break;
            case PacketType.Pong:
                packet = new PongPacket(null, bufferSize);
                break;
            case PacketType.Move:
                packet = new MovePacket(null, bufferSize);
                break;
            case PacketType.GotoAck:
                packet = new GotoAckPacket(null, bufferSize);
                break;
            case PacketType.ShootAck:
                packet = new ShootAckPacket(null, bufferSize);
                break;
            case PacketType.Text:
                packet = new TextPacket(null, bufferSize);
                break;
            case PacketType.PlayerText:
                packet = new PlayerTextPacket(null, bufferSize);
                break;
            case PacketType.Create:
                packet = new CreatePacket(null, bufferSize);
                break;
        }
        packet.type = type;
        return packet;
    }
}
