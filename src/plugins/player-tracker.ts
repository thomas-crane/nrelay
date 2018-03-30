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
    private trackAll = false;

    constructor() {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        this.trackedPlayers = {};
        Client.on('disconnect', (pd, client: Client) => {
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
    public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        return this.emitter.on(event, listener);
    }

    /**
     * Enables tracking for all clients including clients added at runtime.
     */
    public trackAllPlayers(): void {
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
    public trackPlayersFor(client: Client): void {
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
    public getAllPlayers(): IPlayerData[] {
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
    public getPlayersFor(client: Client): IPlayerData[] | null {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            return null;
        }
        return this.trackedPlayers[client.guid];
    }

    @HookPacket(PacketType.UPDATE)
    private onUpdate(client: Client, update: UpdatePacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            if (this.trackAll) {
                this.trackedPlayers[client.guid] = [];
            } else {
                return;
            }
        }
        for (let i = 0; i < update.newObjects.length; i++) {
            if (Classes[update.newObjects[i].objectType]) {
                const pd = ObjectStatusData.processObject(update.newObjects[i]);
                pd.server = client.server.name;
                this.trackedPlayers[client.guid].push(pd);
                this.emitter.emit('enter', pd);
            }
        }
        for (let i = 0; i < update.drops.length; i++) {
            for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
                if (this.trackedPlayers[client.guid][n].objectId === update.drops[i]) {
                    const pd = this.trackedPlayers[client.guid].splice(n, 1)[0];
                    this.emitter.emit('leave', pd);
                    break;
                }
            }
        }
    }

    @HookPacket(PacketType.NEWTICK)
    private onNewTick(client: Client, newTick: NewTickPacket): void {
        if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
            if (this.trackAll) {
                this.trackedPlayers[client.guid] = [];
            } else {
                return;
            }
        }
        for (let i = 0; i < newTick.statuses.length; i++) {
            for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
                if (newTick.statuses[i].objectId === this.trackedPlayers[client.guid][n].objectId) {
                    this.trackedPlayers[client.guid][n] =
                        ObjectStatusData.processStatData(newTick.statuses[i].stats, this.trackedPlayers[client.guid][n]);
                    this.trackedPlayers[client.guid][n].worldPos = newTick.statuses[i].pos;
                    break;
                }
            }
        }
    }
}
