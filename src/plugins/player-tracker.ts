import { NrPlugin, HookPacket, Client, Log, LogLevel, PacketType } from './../core/plugin-module';
import { IPlayerData } from './../models/playerdata';
import { Classes } from './../models/classes';
import { UpdatePacket } from './../networking/packets/incoming/update-packet';
import { ObjectStatusData } from './../networking/data/object-status-data';
import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';
import { EventEmitter } from 'events';

@NrPlugin({
    name: 'Player Tracker',
    author: 'tcrane'
})
export class PlayerTracker {

    private emitter: EventEmitter;
    private readonly trackedPlayers: {
        [guid: string]: IPlayerData[]
    };

    constructor() {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        this.trackedPlayers = {};
        Client.on('disconnect', (pd, client: Client) => {
            if (this.trackedPlayers.hasOwnProperty(client.alias)) {
                this.trackedPlayers[client.alias] = [];
            }
        });
    }

    public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        return this.emitter.on(event, listener);
    }

    public trackPlayersFor(client: Client): void {
        if (!this.trackedPlayers.hasOwnProperty(client.alias)) {
            this.trackedPlayers[client.alias] = [];
            Log('Player Tracker', 'Tracking players for ' + client.alias, LogLevel.Success);
        } else {
            Log('Player Tracker', 'Already tracking players for ' + client.alias, LogLevel.Warning);
        }
    }

    public getPlayersFor(client: Client): IPlayerData[] | null {
        if (!this.trackedPlayers.hasOwnProperty(client.alias)) {
            return null;
        }
        return this.trackedPlayers[client.alias];
    }

    @HookPacket(PacketType.UPDATE)
    private onUpdate(client: Client, update: UpdatePacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.alias)) {
            return;
        }
        for (let i = 0; i < update.newObjects.length; i++) {
            if (Classes[update.newObjects[i].objectType]) {
                const pd = ObjectStatusData.processObject(update.newObjects[i]);
                pd.server = client.server.name;
                this.trackedPlayers[client.alias].push(pd);
                this.emitter.emit('enter', (pd));
            }
        }
        for (let i = 0; i < update.drops.length; i++) {
            for (let n = 0; n < this.trackedPlayers[client.alias].length; n++) {
                if (this.trackedPlayers[client.alias][n].objectId === update.drops[i]) {
                    const pd = this.trackedPlayers[client.alias].splice(n, 1)[0];
                    this.emitter.emit('leave', pd);
                    break;
                }
            }
        }
    }

    @HookPacket(PacketType.NEWTICK)
    private onNewTick(client: Client, newTick: NewTickPacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.alias)) {
            return;
        }
        for (let i = 0; i < newTick.statuses.length; i++) {
            for (let n = 0; n < this.trackedPlayers[client.alias].length; n++) {
                if (newTick.statuses[i].objectId === this.trackedPlayers[client.alias][n].objectId) {
                    this.trackedPlayers[client.alias][n] =
                        ObjectStatusData.processStatData(newTick.statuses[i].stats, this.trackedPlayers[client.alias][n]);
                    this.trackedPlayers[client.alias][n].worldPos = newTick.statuses[i].pos;
                    break;
                }
            }
        }
    }
}
