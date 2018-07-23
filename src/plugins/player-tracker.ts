import { Library, PacketHook, Client, Log, LogLevel, PacketType } from './../core';
import { IPlayerData, Classes } from './../models';
import { UpdatePacket, NewTickPacket } from './../networking/packets/incoming';
import { ObjectStatusData } from './../networking/data';
import { EventEmitter } from 'events';

@Library({
    name: 'Player Tracker',
    author: 'tcrane'
})
export class PlayerTracker {

    private emitter: EventEmitter;
    private readonly trackedPlayers: {
        [guid: string]: IPlayerData[]
    };
    private trackAll = false;

    constructor() {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        this.trackedPlayers = {};
        Client.on('connect', (client) => {
            if (this.trackedPlayers.hasOwnProperty(client.guid)) {
                this.trackedPlayers[client.guid] = [];
            }
        });
    }

    /**
     * Attaches an event listener to the specified event.
     * @param event The event to attach the listener to.
     * @param listener The function to invoke when the event is fired.
     */
    on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        return this.emitter.on(event, listener);
    }

    /**
     * Enables tracking for all clients including clients added at runtime.
     */
    trackAllPlayers(): void {
        if (!this.trackAll) {
            Log('Player Tracker', 'Enabled tracking for all clients.', LogLevel.Success);
            this.trackAll = true;
        } else {
            Log('Player Tracker', 'Tracking for all players has already been enabled.', LogLevel.Warning);
        }
    }

    /**
     * Enables player tracking for the specified client.
     * @param client The client to enable tracking for.
     */
    trackPlayersFor(client: Client): void {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            this.trackedPlayers[client.guid] = [];
            Log('Player Tracker', `Tracking players for ${client.alias}`, LogLevel.Success);
        } else {
            Log('Player Tracker', `Already tracking players for ${client.alias}`, LogLevel.Warning);
        }
    }

    /**
     * Returns all tracked players, or an empty array if there are no clients tracking players.
     */
    getAllPlayers(): IPlayerData[] {
        let players: IPlayerData[] = [];
        Object.keys(this.trackedPlayers).map((guid) => {
            players = players.concat(this.trackedPlayers[guid]);
        });
        return players.filter((player, index, self) => {
            return index === self.findIndex((p) => p.name === player.name);
        });
    }

    /**
     * Returns the list of players visible to the `client` provided.
     * @param client The client to get players for.
     */
    getPlayersFor(client: Client): IPlayerData[] | null {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            Log('Player Tracker', `Players are not being tracked for ${client.alias}. Did you forget to call trackPlayersFor(client)?`);
            return null;
        }
        return this.trackedPlayers[client.guid];
    }

    @PacketHook()
    private onUpdate(client: Client, update: UpdatePacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            if (this.trackAll) {
                this.trackedPlayers[client.guid] = [];
            } else {
                return;
            }
        }
        for (const obj of update.newObjects) {
            if (Classes[obj.objectType]) {
                const pd = ObjectStatusData.processObject(obj);
                pd.server = client.server.name;
                this.trackedPlayers[client.guid].push(pd);
                this.emitter.emit('enter', pd);
            }
        }
        for (const drop of update.drops) {
            for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
                if (this.trackedPlayers[client.guid][n].objectId === drop) {
                    const pd = this.trackedPlayers[client.guid].splice(n, 1)[0];
                    this.emitter.emit('leave', pd);
                    break;
                }
            }
        }
    }

    @PacketHook()
    private onNewTick(client: Client, newTick: NewTickPacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            if (this.trackAll) {
                this.trackedPlayers[client.guid] = [];
            } else {
                return;
            }
        }
        for (const status of newTick.statuses) {
            for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
                if (status.objectId === this.trackedPlayers[client.guid][n].objectId) {
                    this.trackedPlayers[client.guid][n] =
                        ObjectStatusData.processStatData(status.stats, this.trackedPlayers[client.guid][n]);
                    this.trackedPlayers[client.guid][n].worldPos = status.pos;
                    break;
                }
            }
        }
    }
}
