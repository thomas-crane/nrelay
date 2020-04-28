import { NewTickPacket, ObjectStatusData, StatType, UpdatePacket } from '@realmlib/net';
import { EventEmitter } from 'events';
import { Events } from '../models/events';
import { PetData } from '../models/pet-data';
import { Runtime } from '../runtime';
import { Client, Library, PacketHook } from './../core';

/**
 * An event listener for events emitted by the `PetTracker`.
 */
export type PetEventListener = (pet: PetData, client: Client) => void;

@Library({
  name: 'Pet Tracker',
  author: 'tcrane',
  description: 'A utility library for keeping track of pets.',
})
export class PetTracker {

  private emitter: EventEmitter;
  private readonly trackedPets: {
    [guid: string]: PetData[],
  };

  constructor(private runtime: Runtime) {
    this.emitter = new EventEmitter();
    this.trackedPets = {};
    runtime.on(Events.ClientConnect, (client: Client) => {
      this.trackedPets[client.guid] = [];
    });
  }

  /**
   * Attaches an event listener to the specified event.
   * @param event The event to attach the listener to.
   * @param listener The function to invoke when the event is fired.
   */
  on(event: 'enter' | 'leave', listener: PetEventListener): EventEmitter {
    return this.emitter.on(event, listener);
  }

  /**
   * Returns all of the pets which are currently being tracked.
   */
  getAllPets(): PetData[] {
    let pets: PetData[] = [];
    Object.keys(this.trackedPets).map((guid) => {
      pets = pets.concat(this.trackedPets[guid]);
    });
    return pets.filter((player, index, self) => {
      return index === self.findIndex((p) => p.name === player.name);
    });
  }

  /**
   * Returns the list of pets visible to the `client` provided.
   * @param client The client to get pets for.
   */
  getPetsFor(client: Client): PetData[] {
    if (!this.trackedPets.hasOwnProperty(client.guid)) {
      return [];
    }
    return this.trackedPets[client.guid];
  }

  @PacketHook()
  private onUpdate(client: Client, update: UpdatePacket): void {
    if (!this.trackedPets.hasOwnProperty(client.guid)) {
      this.trackedPets[client.guid] = [];
    }
    for (const obj of update.newObjects) {
      if (this.runtime.resources.pets[obj.objectType] !== undefined) {
        const pet = this.parsePetData(obj.status);
        this.trackedPets[client.guid].push(pet);
        this.emitter.emit('enter', pet, client);
      }
    }
    for (const drop of update.drops) {
      for (let n = 0; n < this.trackedPets[client.guid].length; n++) {
        if (this.trackedPets[client.guid][n].objectId === drop) {
          const pd = this.trackedPets[client.guid].splice(n, 1)[0];
          this.emitter.emit('leave', pd, client);
          break;
        }
      }
    }
  }

  @PacketHook()
  private onNewTick(client: Client, newTick: NewTickPacket): void {
    if (!this.trackedPets.hasOwnProperty(client.guid)) {
      this.trackedPets[client.guid] = [];
    }
    for (const status of newTick.statuses) {
      for (let n = 0; n < this.trackedPets[client.guid].length; n++) {
        if (status.objectId === this.trackedPets[client.guid][n].objectId) {
          this.trackedPets[client.guid][n] = this.parsePetData(status, this.trackedPets[client.guid][n]);
          break;
        }
      }
    }
  }

  private parsePetData(status: ObjectStatusData, existing?: PetData): PetData {
    if (!existing) {
      existing = {} as PetData;
    }
    existing.objectId = status.objectId;
    existing.ownerId = status.objectId - 1;
    existing.worldPos = status.pos;
    for (const stat of status.stats) {
      switch (stat.statType) {
        case StatType.HP_STAT:
          existing.hp = stat.statValue;
          continue;
        case StatType.SIZE_STAT:
          existing.size = stat.statValue;
          continue;
        case StatType.CONDITION_STAT:
          existing.condition = stat.statValue;
          continue;
        case StatType.TEXTURE_STAT:
          existing.texture = stat.statValue;
          continue;
        case StatType.PET_INSTANCEID_STAT:
          existing.instanceId = stat.statValue;
          continue;
        case StatType.PET_NAME_STAT:
          existing.name = stat.stringStatValue;
          continue;
        case StatType.PET_TYPE_STAT:
          existing.type = stat.statValue;
          continue;
        case StatType.PET_RARITY_STAT:
          existing.rarity = stat.statValue;
          continue;
        case StatType.PET_MAXABILITYPOWER_STAT:
          existing.maxAbilityPower = stat.statValue;
          continue;
        case StatType.PET_FAMILY_STAT:
          existing.family = stat.statValue;
          continue;
        case StatType.PET_FIRSTABILITY_POINT_STAT:
          existing.firstAbilityPoint = stat.statValue;
          continue;
        case StatType.PET_SECONDABILITY_POINT_STAT:
          existing.secondAbilityPoint = stat.statValue;
          continue;
        case StatType.PET_THIRDABILITY_POINT_STAT:
          existing.thirdAbilityPoint = stat.statValue;
          continue;
        case StatType.PET_FIRSTABILITY_POWER_STAT:
          existing.firstAbilityPower = stat.statValue;
          continue;
        case StatType.PET_SECONDABILITY_POWER_STAT:
          existing.secondAbilityPower = stat.statValue;
          continue;
        case StatType.PET_THIRDABILITY_POWER_STAT:
          existing.thirdAbilityPower = stat.statValue;
          continue;
        case StatType.PET_FIRSTABILITY_TYPE_STAT:
          existing.firstAbilityType = stat.statValue;
          continue;
        case StatType.PET_SECONDABILITY_TYPE_STAT:
          existing.secondAbilityType = stat.statValue;
          continue;
        case StatType.PET_THIRDABILITY_TYPE_STAT:
          existing.thirdAbilityType = stat.statValue;
          continue;
      }
    }
    return existing;
  }
}
