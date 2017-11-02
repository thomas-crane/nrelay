import { NrPlugin } from './../decorators/plugin';
import { HookPacket } from './../decorators/hook-packet';
import { Packet, PacketType } from './../networking/packet';
import { Client } from './../core/client';
import { Log } from './../services/logger';

import { UpdatePacket } from './../networking/packets/incoming/update-packet';
import { TextPacket } from './../networking/packets/incoming/text-packet';
import { PlayerTextPacket } from './../networking/packets/outgoing/playertext-packet';
import { Classes} from './../models/classes';
import { IPlayerData } from './../models/playerdata';
import { ObjectStatusData } from './../networking/data/object-status-data';

import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';

const MOVE_TO_REGEX = /^moveto ([a-zA-Z]+)\.*/;
const FOLLOW_REGEX = /^follow ([a-zA-Z]+)\.*/;

@NrPlugin({
    name: 'Your Plugin Name',
    author: 'Your Name'
})
export default class YourPluginName {

    keys: string[];
    players: { [id: number]: IPlayerData };
    playerNames: { [id: string]: number };
    follow: boolean;

    private followObjectId: number;

    constructor() {
        this.keys = Object.keys(Classes);
        this.players = {};
        this.playerNames = {};
    }

    @HookPacket(PacketType.Update)
    onUpdate(client: Client, updatePacket: UpdatePacket): void {
        for (let i = 0; i < updatePacket.newObjects.length; i++) {
            if (updatePacket.newObjects[i].objectType in Classes) {
                const player = ObjectStatusData.processStatData(updatePacket.newObjects[i].status);
                if (!this.players) {
                    this.players = {};
                }
                if (!this.playerNames) {
                    this.playerNames = {};
                }
                this.playerNames[player.name.toLowerCase()] = player.objectId;
                this.players[player.objectId] = player;
            }
        }
        for (let i = 0; i < updatePacket.drops.length; i++) {
            if (this.players[updatePacket.drops[i]]) {
                delete this.playerNames[updatePacket.drops[i]];
                delete this.players[updatePacket.drops[i]];
            }
        }
    }

    @HookPacket(PacketType.NewTick)
    onNewTick(client: Client, newTickPacket: NewTickPacket): void {
        for (let i = 0; i < newTickPacket.statuses.length; i++) {
            if (this.players[newTickPacket.statuses[i].objectId]) {
                this.players[newTickPacket.statuses[i].objectId].worldPos = newTickPacket.statuses[i].pos;
            }
        }
        if (this.followObjectId > 0) {
            client.nextPos = this.players[this.followObjectId].worldPos;
        }
    }

    @HookPacket(PacketType.Text)
    onTextPacket(client: Client, textPacket: TextPacket): void {
        if (textPacket.recipent === client.playerData.name) {
            if (MOVE_TO_REGEX.test(textPacket.text)) {
                const match = MOVE_TO_REGEX.exec(textPacket.text.trim());
                if (match === null) {
                    return;
                }
                const playerName = match[1].toLowerCase();

                if (!this.playerNames[playerName]) {
                    const ptPacket = new PlayerTextPacket();
                    ptPacket.text = '/tell ' + textPacket.name + ' Cannot find player: ' + playerName;
                    client.packetio.sendPacket(ptPacket);
                    return;
                }
                client.nextPos = this.players[this.playerNames[playerName]].worldPos;
            } else if (FOLLOW_REGEX.test(textPacket.text)) {
                const match = FOLLOW_REGEX.exec(textPacket.text.trim());
                if (match === null) {
                    return;
                }
                const playerName = match[1].toLowerCase();

                if (!this.playerNames[playerName]) {
                    const ptPacket = new PlayerTextPacket();
                    ptPacket.text = '/tell ' + textPacket.name + ' Cannot find player: ' + playerName;
                    client.packetio.sendPacket(ptPacket);
                    return;
                }
                client.nextPos = this.players[this.playerNames[playerName]].worldPos;
                this.followObjectId = this.playerNames[playerName];
            }
        }
    }
}
