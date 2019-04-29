/**
 * @module stdlib
 */
import { NewTickPacket, UpdatePacket } from '@realmlib/net';
import { EventEmitter } from 'events';
import { Events } from '../models/events';
import { Runtime } from '../runtime';
import * as parsers from '../util/parsers';
import { Client, Library, PacketHook } from './../core';
import { Classes, PlayerData } from './../models';

/**
 * An event listener for events emitted by the `PlayerTracker`.
 */
export type PlayerEventListener = (player: PlayerData, client: Client) => void;

@Library({
  name: 'Player Tracker',
  author: 'tcrane',
  description: 'A utility library for keeping track of other players visible to connected clients.',
})
export class PlayerTracker {

  private emitter: EventEmitter;
  private readonly trackedPlayers: {
    [guid: string]: PlayerData[],
  };

  constructor(runtime: Runtime) {
    this.emitter = new EventEmitter();
    this.trackedPlayers = {};
    runtime.on(Events.ClientConnect, (client: Client) => {
      this.trackedPlayers[client.guid] = [];
    });
  }

  /**
   * Attaches an event listener to the specified event.
   * @param event The event to attach the listener to.
   * @param listener The function to invoke when the event is fired.
   */
  on(event: 'enter' | 'leave', listener: PlayerEventListener): EventEmitter {
    return this.emitter.on(event, listener);
  }

  /**
   * Returns all tracked players, or an empty array if there are no clients tracking players.
   */
  getAllPlayers(): PlayerData[] {
    let players: PlayerData[] = [];
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
  getPlayersFor(client: Client): PlayerData[] | null {
    if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
      return [];
    }
    return this.trackedPlayers[client.guid];
  }

  @PacketHook()
  private onUpdate(client: Client, update: UpdatePacket): void {
    if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
      this.trackedPlayers[client.guid] = [];
    }
    for (const obj of update.newObjects) {
      if (Classes[obj.objectType]) {
        const pd = parsers.processObject(obj);
        pd.server = client.server.name;
        this.trackedPlayers[client.guid].push(pd);
        this.emitter.emit('enter', pd, client);
      }
    }
    for (const drop of update.drops) {
      for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
        if (this.trackedPlayers[client.guid][n].objectId === drop) {
          const pd = this.trackedPlayers[client.guid].splice(n, 1)[0];
          this.emitter.emit('leave', pd, client);
          break;
        }
      }
    }
  }

  @PacketHook()
  private onNewTick(client: Client, newTick: NewTickPacket): void {
    if (!this.trackedPlayers.hasOwnProperty(client.guid)) {
      this.trackedPlayers[client.guid] = [];
    }
    for (const status of newTick.statuses) {
      for (let n = 0; n < this.trackedPlayers[client.guid].length; n++) {
        if (status.objectId === this.trackedPlayers[client.guid][n].objectId) {
          this.trackedPlayers[client.guid][n] =
            parsers.processStatData(status.stats, this.trackedPlayers[client.guid][n]);
          this.trackedPlayers[client.guid][n].worldPos = status.pos;
          break;
        }
      }
    }
  }
}
