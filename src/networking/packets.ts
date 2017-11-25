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
import { GotoPacket } from './packets/incoming/goto-packet';
import { GotoAckPacket } from './packets/outgoing/gotoack-packet';
import { ShootAckPacket } from './packets/outgoing/shootack-packet';
import { TextPacket } from './packets/incoming/text-packet';
import { PlayerTextPacket } from './packets/outgoing/playertext-packet';
import { CreatePacket } from './packets/outgoing/create-packet';
import { TradeAcceptedPacket } from './packets/incoming/trade-accepted';
import { TradeChangedPacket } from './packets/incoming/trade-changed';
import { TradeDonePacket } from './packets/incoming/trade-done-packet';
import { TradeRequestedPacket } from './packets/incoming/trade-requested-packet';
import { TradeStartPacket } from './packets/incoming/trade-start-packet';
import { AcceptTradePacket } from './packets/outgoing/accept-trade-packet';
import { CancelTradePacket } from './packets/outgoing/cancel-trade-packet';
import { ChangeTradePacket } from './packets/outgoing/change-trade-packet';
import { RequestTradePacket } from './packets/outgoing/request-trade-packet';
import { ServerPlayerShootPacket } from './packets/incoming/server-player-shoot-packet';

import { PacketType, Packet } from './packet';

export class Packets {
    public static create(type: PacketType, bufferSize?: number): Packet {
        if (!PacketType[type]) {
            throw new Error('Invalid packet type: ' + type);
        }
        let packet: Packet;
        switch (type) {
            case PacketType.HELLO:
                packet = new HelloPacket(null, bufferSize);
                break;
            case PacketType.MAPINFO:
                packet = new MapInfoPacket(null, bufferSize);
                break;
            case PacketType.LOAD:
                packet = new LoadPacket(null, bufferSize);
                break;
            case PacketType.FAILURE:
                packet = new FailurePacket(null, bufferSize);
                break;
            case PacketType.CREATESUCCESS:
                packet = new CreateSuccessPacket(null, bufferSize);
                break;
            case PacketType.UPDATE:
                packet = new UpdatePacket(null, bufferSize);
                break;
            case PacketType.UPDATEACK:
                packet = new UpdateAckPacket(null, bufferSize);
                break;
            case PacketType.AOE:
                packet = new AoePacket(null, bufferSize);
                break;
            case PacketType.AOEACK:
                packet = new AoeAckPacket(null, bufferSize);
                break;
            case PacketType.NEWTICK:
                packet = new NewTickPacket(null, bufferSize);
                break;
            case PacketType.PING:
                packet = new PingPacket(null, bufferSize);
                break;
            case PacketType.PONG:
                packet = new PongPacket(null, bufferSize);
                break;
            case PacketType.MOVE:
                packet = new MovePacket(null, bufferSize);
                break;
            case PacketType.GOTO:
                packet = new GotoPacket(null, bufferSize);
                break;
            case PacketType.GOTOACK:
                packet = new GotoAckPacket(null, bufferSize);
                break;
            case PacketType.SHOOTACK:
                packet = new ShootAckPacket(null, bufferSize);
                break;
            case PacketType.TEXT:
                packet = new TextPacket(null, bufferSize);
                break;
            case PacketType.PLAYERTEXT:
                packet = new PlayerTextPacket(null, bufferSize);
                break;
            case PacketType.CREATE:
                packet = new CreatePacket(null, bufferSize);
                break;
            case PacketType.TRADEACCEPTED:
                packet = new TradeAcceptedPacket(null, bufferSize);
                break;
            case PacketType.TRADECHANGED:
                packet = new TradeChangedPacket(null, bufferSize);
                break;
            case PacketType.TRADEDONE:
                packet = new TradeDonePacket(null, bufferSize);
                break;
            case PacketType.TRADEREQUESTED:
                packet = new TradeRequestedPacket(null, bufferSize);
                break;
            case PacketType.TRADESTART:
                packet = new TradeStartPacket(null, bufferSize);
                break;
            case PacketType.ACCEPTTRADE:
                packet = new AcceptTradePacket(null, bufferSize);
                break;
            case PacketType.CANCELTRADE:
                packet = new CancelTradePacket(null, bufferSize);
                break;
            case PacketType.CHANGETRADE:
                packet = new ChangeTradePacket(null, bufferSize);
                break;
            case PacketType.REQUESTTRADE:
                packet = new RequestTradePacket(null, bufferSize);
                break;
            case PacketType.SERVERPLAYERSHOOT:
                packet = new ServerPlayerShootPacket(null, bufferSize);
                break;
        }
        packet.type = type;
        return packet;
    }
}
