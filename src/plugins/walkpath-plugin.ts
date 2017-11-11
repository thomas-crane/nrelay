import { NrPlugin } from './../decorators/plugin';
import { HookPacket } from './../decorators/hook-packet';
import { Packet, PacketType } from './../networking/packet';
import { Client } from './../core/client';
import { Log } from './../services/logger';

import { WorldPosData } from './../networking/data/world-pos-data';
import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';

const path = [
    { x: 125.1288, y: 125.9407 }, // bottom-left
    { x: 134.9411, y: 125.9407 }, // bottom-right
    { x: 134.9411, y: 118.0530 }, // top-right
    { x: 125.1288, y: 118.0530 }  // top-left
];

@NrPlugin({
    name: 'Path Walker',
    author: 'tcrane'
})
export default class WalkpathPlugin {

    private players: {
        [id: number]: any[]
    };

    constructor() {
        this.players = {};
    }

    @HookPacket(PacketType.NewTick)
    onNewTick(client: Client, newTickPacket: NewTickPacket): void {
        if (!this.players[client.playerData.objectId]) {
            this.players[client.playerData.objectId] = path.slice();
        }
        if (!client.nextPos) {
            const wp = new WorldPosData();
            const point = this.players[client.playerData.objectId].pop();
            this.players[client.playerData.objectId].unshift(point);
            wp.x = point.x;
            wp.y = point.y;
            client.nextPos = wp;
        }
    }
}
