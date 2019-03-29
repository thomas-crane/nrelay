/**
 * @module core
 */
import { Environment } from '../runtime/environment';
import { GameObject, ProjectileInfo, Tile } from './../models';
import { Logger, LogLevel } from './../services';

/**
 * Loads and manages game resources.
 */
export class ResourceManager {

  readonly tiles: { [id: number]: Tile };
  readonly objects: { [id: number]: GameObject };
  readonly items: { [id: number]: GameObject };
  readonly enemies: { [id: number]: GameObject };
  readonly pets: { [id: number]: GameObject };

  constructor(readonly env: Environment) {
    this.tiles = {};
    this.objects = {};
    this.items = {};
    this.enemies = {};
    this.pets = {};
  }

  /**
   * Loads all available resources.
   */
  loadAllResources(): Promise<void> {
    return Promise.all([
      this.loadTileInfo(),
      this.loadObjects()
    ]).then(() => null);
  }

  /**
   * Loads the GroundTypes resource.
   */
  loadTileInfo(): void {
    const groundTypes = this.env.readJSON<any>('resources', 'GroundTypes.json');
    if (!groundTypes) {
      throw new Error('Could not load GroundTypes.json');
    }
    let tileArray: any[] = groundTypes['Ground'];
    for (const tile of tileArray) {
      try {
        this.tiles[+tile.type] = {
          type: +tile.type,
          id: tile.id,
          sink: (tile.Sink ? true : false),
          speed: (+tile.Speed || 1),
          noWalk: (tile.NoWalk ? true : false)
        };
      } catch {
        Logger.log('ResourceManager', `Failed to load tile: ${tile.type}`, LogLevel.Debug);
      }
    }
    Logger.log('ResourceManager', `Loaded ${tileArray.length} tiles.`, LogLevel.Info);
    tileArray = null;
  }

  /**
   * Loads the Objects resource.
   */
  loadObjects(): void {
    const objects = this.env.readJSON<any>('resources', 'Objects.json');
    let itemCount = 0;
    let enemyCount = 0;
    let petCount = 0;
    let objectsArray: any[] = objects['Object'];
    for (const current of objectsArray) {
      try {
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
          this.objects[+current.type].projectiles = new Array<ProjectileInfo>(current.Projectile.length);
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
              multiHit: (current.Projectile[j].MultiHit === '' ? true : false),
              passesCover: (current.Projectile[j].PassesCover === '' ? true : false),
              frequency: (+current.Projectile[j].Frequency || 0),
              amplitude: (+current.Projectile[j].Amplitude || 0),
              magnitude: (+current.Projectile[j].Magnitude || 0),
              conditionEffects: []
            };
            if (Array.isArray(current.Projectile[j].ConditionEffect)) {
              for (const effect of current.Projectile[j].ConditionEffect) {
                this.objects[+current.type].projectiles[j].conditionEffects.push({
                  effectName: effect._,
                  duration: effect.duration
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
            multiHit: (current.Projectile.MultiHit === '' ? true : false),
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
            for (const bonus of current.ActivateOnEquip) {
              if (bonus['_'] === 'IncrementStat') {
                this.objects[+current.type].activateOnEquip.push({
                  statType: bonus.stat,
                  amount: bonus.amount
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
        Logger.log('ResourceManager', `Failed to load object: ${current.type}`, LogLevel.Debug);
      }
    }
    Logger.log('ResourceManager', `Loaded ${objectsArray.length} objects.`, LogLevel.Info);
    Logger.log('ResourceManager', `Loaded ${itemCount} items.`, LogLevel.Debug);
    Logger.log('ResourceManager', `Loaded ${enemyCount} enemies.`, LogLevel.Debug);
    Logger.log('ResourceManager', `Loaded ${petCount} pets.`, LogLevel.Debug);
    objectsArray = null;
  }
}
