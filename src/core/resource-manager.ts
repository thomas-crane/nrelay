import { Log, LogLevel } from './../services/logger';
import fs = require('fs');
import path = require('path');
import { ITile } from './../models/tile';
import { IObject } from './../models/object';
import { environment } from './../models/environment';
import { Storage } from './../services/storage';

const dir = path.dirname(require.main.filename);

export class ResourceManager {

    static tiles: { [id: number]: ITile };
    static objects: { [id: number]: IObject };
    static items: { [id: number]: IObject };
    static enemies: { [id: number]: IObject };
    static pets: { [id: number]: IObject };

    static loadTileInfo(): Promise<void> {
        return new Promise((resolve: () => void, reject: () => void) => {
            this.tiles = {};
            Storage.get('resources', 'GroundTypes.json').then((data) => {
                let tileArray: any[] = data['Ground'];
                for (let i = 0; i < tileArray.length; i++) {
                    try {
                        this.tiles[+tileArray[i].type] = {
                            type: +tileArray[i].type,
                            id: tileArray[i].id,
                            sink: (tileArray[i].Sink ? true : false),
                            speed: (+tileArray[i].Speed || 1),
                            noWalk: (tileArray[i].NoWalk ? true : false)
                        };
                    } catch {
                        if (environment.debug) {
                            Log('ResourceManager', 'Failed to load tile: ' + tileArray[i].type, LogLevel.Warning);
                        }
                    }
                }
                Log('ResourceManager', 'Loaded ' + tileArray.length + ' tiles.', LogLevel.Info);
                tileArray = null;
                data = null;
                resolve();
            }).catch((error) => {
                Log('ResourceManager', 'Error reading GroundTypes.json', LogLevel.Warning);
                if (environment.debug) {
                    Log('ResourceManager', error, LogLevel.Info);
                }
                resolve();
                return;
            });
        });
    }

    static loadObjects(): Promise<any> {
        return new Promise((resolve: () => void, reject: () => void) => {
            this.objects = {};
            this.items = {};
            this.enemies = {};
            this.pets = {};
            Storage.get('resources', 'Objects.json').then((data) => {
                let itemCount = 0;
                let enemyCount = 0;
                let petCount = 0;
                let objectsArray: any[] = data['Object'];
                for (let i = 0; i < objectsArray.length; i++) {
                    try {
                        this.objects[+objectsArray[i].type] = {
                            type: +objectsArray[i].type,
                            id: objectsArray[i].id,
                            enemy: (objectsArray[i].Enemy === '' ? true : false),
                            item: (objectsArray[i].Item === '' ? true : false),
                            god: (objectsArray[i].God === '' ? true : false),
                            pet: (objectsArray[i].Pet === '' ? true : false),
                            slotType: (+objectsArray[i].SlotType || -1),
                            bagType: (+objectsArray[i].BagType || -1),
                            class: objectsArray[i].Class,
                            maxHitPoints: (+objectsArray[i].MaxHitPoints || -1),
                            defense: (+objectsArray[i].Defense || -1),
                            xpMultiplier: (+objectsArray[i].XpMult || -1),
                            activateOnEquip: [],
                            projectile: (objectsArray[i].Projectile ? {
                                id: +objectsArray[i].Projectile.id,
                                objectId: objectsArray[i].Projectile.ObjectId,
                                damage: (+objectsArray[i].Projectile.damage || -1),
                                minDamage: (+objectsArray[i].Projectile.MinDamage || -1),
                                maxDamage: (+objectsArray[i].Projectile.maxDamage || -1),
                                speed: +objectsArray[i].Projectile.Speed,
                                lifetimeMS: +objectsArray[i].Projectile.LifetimeMS
                            } : null),
                            rateOfFire: (+objectsArray[i].RateOfFire || -1),
                            fameBonus: (+objectsArray[i].FameBonus || -1),
                            feedPower: (+objectsArray[i].FeedPower || -1),
                            fullOccupy: (objectsArray[i].FullOccupy === '' ? true : false),
                            occupySquare: (objectsArray[i].OccupySquare === '' ? true : false),
                        };
                        // map items.
                        if (this.objects[+objectsArray[i].type].item) {
                            // stat bonuses
                            if (Array.isArray(objectsArray[i].ActivateOnEquip)) {
                                for (let j = 0; j < objectsArray[i].ActivateOnEquip.length; j++) {
                                    if (objectsArray[i].ActivateOnEquip[j]['_'] === 'IncrementStat') {
                                        this.objects[+objectsArray[i].type].activateOnEquip.push({
                                            statType: objectsArray[i].ActivateOnEquip[j].stat,
                                            amount: objectsArray[i].ActivateOnEquip[j].amount
                                        });
                                    }
                                }
                            } else if (typeof objectsArray[i].ActivateOnEquip === 'object') {
                                if (objectsArray[i].ActivateOnEquip._ === 'IncrementStat') {
                                    this.objects[+objectsArray[i].type].activateOnEquip.push({
                                        statType: objectsArray[i].ActivateOnEquip.stat,
                                        amount: objectsArray[i].ActivateOnEquip.amount
                                    });
                                }
                            }
                            this.items[+objectsArray[i].type] = this.objects[+objectsArray[i].type];
                            itemCount++;
                        }
                        // map enemies.
                        if (this.objects[+objectsArray[i].type].enemy) {
                            this.enemies[+objectsArray[i].type] = this.objects[+objectsArray[i].type];
                            enemyCount++;
                        }
                        // map pets.
                        if (this.objects[+objectsArray[i].type].pet) {
                            this.pets[+objectsArray[i].type] = this.objects[+objectsArray[i].type];
                            petCount++;
                        }
                    } catch {
                        if (environment.debug) {
                            Log('ResourceManager', 'Failed to load tile: ' + objectsArray[i].type, LogLevel.Warning);
                        }
                    }
                }
                Log('ResourceManager', 'Loaded ' + objectsArray.length + ' objects.', LogLevel.Info);
                if (environment.debug) {
                    Log('ResourceManager', 'Loaded ' + itemCount + ' items.', LogLevel.Info);
                    Log('ResourceManager', 'Loaded ' + enemyCount + ' enemies.', LogLevel.Info);
                    Log('ResourceManager', 'Loaded ' + petCount + ' pets.', LogLevel.Info);
                }
                objectsArray = null;
                data = null;
                resolve();
            }).catch((error) => {
                Log('ResourceManager', 'Error reading Objects.json', LogLevel.Warning);
                if (environment.debug) {
                    Log('ResourceManager', error, LogLevel.Info);
                }
                resolve();
                return;
            });
        });
    }
}
