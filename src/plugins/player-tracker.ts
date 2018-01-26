import { NrPlugin, HookPacket, Client, Log, LogLevel, PacketType } from './../core/plugin-module';
import { IPlayerData } from './../models/playerdata';
import { Classes } from './../models/classes';
import { UpdatePacket } from './../networking/packets/incoming/update-packet';
import { ObjectStatusData } from './../networking/data/object-status-data';
import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';

@NrPlugin({
    name: 'Player Tracker',
    author: 'tcrane'
})
export class PlayerTracker {

    private readonly trackedPlayers: {
        [guid: string]: IPlayerData[]
    };

    constructor() {
        this.trackedPlayers = {};
        Client.on('disconnect', (pd, client: Client) => {
            if (this.trackedPlayers.hasOwnProperty(client.alias)) {
                this.trackedPlayers[client.alias] = [];
            }
        });
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
                this.trackedPlayers[client.alias].push(pd);
            }
        }
        this.trackedPlayers[client.alias] = this.trackedPlayers[client.alias].filter((pd) => {
            return update.drops.indexOf(pd.objectId) === -1;
        });
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
