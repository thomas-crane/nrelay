import { Log, LogLevel, Storage } from './../services';
import fs = require('fs');
import path = require('path');
import { IObject, IProjectile, ITile, environment } from './../models';

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
                            Log('ResourceManager', `Failed to load tile: ${tileArray[i].type}`, LogLevel.Warning);
                        }
                    }
                }
                Log('ResourceManager', `Loaded ${tileArray.length} tiles.`, LogLevel.Info);
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
                        const current = objectsArray[i];
                        this.objects[+current.type] = {
                            type: +current.type,
                            id: current.id,
                            enemy: (current.Enemy === '' ? true : false),
                            item: (current.Item === '' ? true : false),
                            god: (current.God === '' ? true : false),
                            pet: (current.Pet === '' ? true : false),
                            slotType: (+current.SlotType || -1),
                            bagType: (+current.BagType || -1),
                            class: current.Class,
                            maxHitPoints: (+current.MaxHitPoints || -1),
                            defense: (+current.Defense || -1),
                            xpMultiplier: (+current.XpMult || -1),
                            activateOnEquip: [],
                            projectiles: [],
                            projectile: null,
                            rateOfFire: (+current.RateOfFire || -1),
                            numProjectiles: (+current.NumProjectiles || -1),
                            arcGap: (+current.ArcGap || -1),
                            fameBonus: (+current.FameBonus || -1),
                            feedPower: (+current.FeedPower || -1),
                            fullOccupy: (current.FullOccupy === '' ? true : false),
                            occupySquare: (current.OccupySquare === '' ? true : false),
                        };
                        if (Array.isArray(current.Projectile)) {
                            this.objects[+current.type].projectiles = new Array<IProjectile>(current.Projectile.length);
                            for (let j = 0; j < current.Projectile.length; j++) {
                                this.objects[+current.type].projectiles[j] = {
                                    id: +current.Projectile[j].id,
                                    objectId: current.Projectile[j].ObjectId,
                                    damage: (+current.Projectile[j].damage || -1),
                                    minDamage: (+current.Projectile[j].MinDamage || -1),
                                    maxDamage: (+current.Projectile[j].MaxDamage || -1),
                                    speed: +current.Projectile[j].Speed,
                                    lifetimeMS: +current.Projectile[j].LifetimeMS,
                                    parametric: (current.Projectile[j].Parametric === '' ? true : false),
                                    wavy: (current.Projectile[j].Wavy === '' ? true : false),
                                    boomerang: (current.Projectile[j].Boomerang === '' ? true : false),
                                    multihit: (current.Projectile[j].MultiHit === '' ? true : false),
                                    passesCover: (current.Projectile[j].PassesCover === '' ? true : false),
                                    frequency: (+current.Projectile[j].Frequency || 0),
                                    amplitude: (+current.Projectile[j].Amplitude || 0),
                                    magnitude: (+current.Projectile[j].Magnitude || 0),
                                    conditionEffects: []
                                };
                                if (Array.isArray(current.Projectile[j].ConditionEffect)) {
                                    for (let n = 0; n < current.Projectile[j].ConditionEffect.length; n++) {
                                        this.objects[+current.type].projectiles[j].conditionEffects.push({
                                            effectName: current.Projectile[j].ConditionEffect[n]._,
                                            duration: current.Projectile[j].ConditionEffect[n].duration
                                        });
                                    }
                                } else if (typeof current.Projectile[j].ConditionEffect === 'object') {
                                    this.objects[+current.type].projectiles[j].conditionEffects.push({
                                        effectName: current.Projectile[j].ConditionEffect._,
                                        duration: current.Projectile[j].ConditionEffect.duration
                                    });
                                }
                            }
                        } else if (typeof current.Projectile === 'object') {
                            this.objects[+current.type].projectile = {
                                id: +current.Projectile.id,
                                objectId: current.Projectile.ObjectId,
                                damage: (+current.Projectile.damage || -1),
                                minDamage: (+current.Projectile.MinDamage || -1),
                                maxDamage: (+current.Projectile.MaxDamage || -1),
                                speed: +current.Projectile.Speed,
                                lifetimeMS: +current.Projectile.LifetimeMS,
                                parametric: (current.Projectile.Parametric === '' ? true : false),
                                wavy: (current.Projectile.Wavy === '' ? true : false),
                                boomerang: (current.Projectile.Boomerang === '' ? true : false),
                                multihit: (current.Projectile.MultiHit === '' ? true : false),
                                passesCover: (current.Projectile.PassesCover === '' ? true : false),
                                frequency: (+current.Projectile.Frequency || 1),
                                amplitude: (+current.Projectile.Amplitude || 0),
                                magnitude: (+current.Projectile.Magnitude || 3),
                                conditionEffects: []
                            };
                            this.objects[+current.type].projectiles.push(this.objects[+current.type].projectile);
                        }
                        // map items.
                        if (this.objects[+current.type].item) {
                            // stat bonuses
                            if (Array.isArray(current.ActivateOnEquip)) {
                                for (let j = 0; j < current.ActivateOnEquip.length; j++) {
                                    if (current.ActivateOnEquip[j]['_'] === 'IncrementStat') {
                                        this.objects[+current.type].activateOnEquip.push({
                                            statType: current.ActivateOnEquip[j].stat,
                                            amount: current.ActivateOnEquip[j].amount
                                        });
                                    }
                                }
                            } else if (typeof current.ActivateOnEquip === 'object') {
                                if (current.ActivateOnEquip._ === 'IncrementStat') {
                                    this.objects[+current.type].activateOnEquip.push({
                                        statType: current.ActivateOnEquip.stat,
                                        amount: current.ActivateOnEquip.amount
                                    });
                                }
                            }
                            this.items[+current.type] = this.objects[+current.type];
                            itemCount++;
                        }
                        // map enemies.
                        if (this.objects[+current.type].enemy) {
                            this.enemies[+current.type] = this.objects[+current.type];
                            enemyCount++;
                        }
                        // map pets.
                        if (this.objects[+current.type].pet) {
                            this.pets[+current.type] = this.objects[+current.type];
                            petCount++;
                        }
                    } catch {
                        if (environment.debug) {
                            Log('ResourceManager', `Failed to load object: ${objectsArray[i].type}`, LogLevel.Warning);
                        }
                    }
                }
                Log('ResourceManager', `Loaded ${objectsArray.length} objects.`, LogLevel.Info);
                if (environment.debug) {
                    Log('ResourceManager', `Loaded ${itemCount} items.`, LogLevel.Info);
                    Log('ResourceManager', `Loaded ${enemyCount} enemies.`, LogLevel.Info);
                    Log('ResourceManager', `Loaded ${petCount} pets.`, LogLevel.Info);
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
