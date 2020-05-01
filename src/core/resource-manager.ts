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
      this.loadObjects(),
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
    let tileArray: any[] = groundTypes.Ground;
    for (const tile of tileArray) {
      try {
        this.tiles[+tile.type] = {
          type: +tile.type,
          id: tile.id,
          sink: (tile.Sink ? true : false),
          speed: isNaN(tile.Speed) ? 1 : +tile.Speed,
          noWalk: (tile.NoWalk ? true : false),
          minDamage: (tile.MinDamage ? parseInt(tile.MinDamage, 10) : undefined),
          maxDamage: (tile.MaxDamage ? parseInt(tile.MaxDamage, 10) : undefined),
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
    let objectsArray: any[] = objects.Object;
    for (const current of objectsArray) {
      if (this.objects[+current.type] != null) {
        continue;
      }
      try {
        this.objects[+current.type] = {
          type: +current.type,
          id: current.id,
          enemy: current.Enemy === '',
          item: current.Item === '',
          god: current.God === '',
          pet: current.Pet === '',
          slotType: isNaN(current.SlotType) ? 0 : +current.SlotType,
          bagType: isNaN(current.BagType) ? 0 : +current.BagType,
          class: current.Class,
          maxHitPoints: isNaN(current.MaxHitPoints) ? 0 : +current.MaxHitPoints,
          defense: isNaN(current.Defense) ? 0 : +current.Defense,
          xpMultiplier: isNaN(current.XpMult) ? 0 : +current.XpMult,
          activateOnEquip: [],
          projectiles: [],
          projectile: null,
          rateOfFire: isNaN(current.RateOfFire) ? 0 : +current.RateOfFire,
          numProjectiles: isNaN(current.NumProjectiles) ? 1 : +current.NumProjectiles,
          arcGap: isNaN(current.ArcGap) ? 11.25 : +current.ArcGap,
          fameBonus: isNaN(current.FameBonus) ? 0 : +current.FameBonus,
          feedPower: isNaN(current.FeedPower) ? 0 : +current.FeedPower,
          fullOccupy: current.FullOccupy === '',
          occupySquare: current.OccupySquare === '',
          protectFromGroundDamage: current.ProtectFromGroundDamage === '',
        };
        if (Array.isArray(current.Projectile)) {
          this.objects[+current.type].projectiles = new Array<ProjectileInfo>(current.Projectile.length);
          for (let j = 0; j < current.Projectile.length; j++) {
            this.objects[+current.type].projectiles[j] = {
              id: +current.Projectile[j].id,
              objectId: current.Projectile[j].ObjectId,
              damage: isNaN(current.Projectile[j].Damage) ? 0 : +current.Projectile[j].Damage,
              armorPiercing: current.Projectile[j].ArmorPiercing === '',
              minDamage: isNaN(current.Projectile[j].MinDamage) ? 0 : +current.Projectile[j].MinDamage,
              maxDamage: isNaN(current.Projectile[j].MaxDamage) ? 0 : +current.Projectile[j].MaxDamage,
              speed: +current.Projectile[j].Speed,
              lifetimeMS: +current.Projectile[j].LifetimeMS,
              parametric: current.Projectile[j].Parametric === '',
              wavy: current.Projectile[j].Wavy === '',
              boomerang: current.Projectile[j].Boomerang === '',
              multiHit: current.Projectile[j].MultiHit === '',
              passesCover: current.Projectile[j].PassesCover === '',
              frequency: isNaN(current.Projectile[j].Frequency) ? 0 : +current.Projectile[j].Frequency,
              amplitude: isNaN(current.Projectile[j].Amplitude) ? 0 : +current.Projectile[j].Amplitude,
              magnitude: isNaN(current.Projectile[j].Magnitude) ? 0 : +current.Projectile[j].Magnitude,
              conditionEffects: [],
            };
            if (Array.isArray(current.Projectile[j].ConditionEffect)) {
              for (const effect of current.Projectile[j].ConditionEffect) {
                this.objects[+current.type].projectiles[j].conditionEffects.push({
                  effectName: effect._,
                  duration: effect.duration,
                });
              }
            } else if (typeof current.Projectile[j].ConditionEffect === 'object') {
              this.objects[+current.type].projectiles[j].conditionEffects.push({
                effectName: current.Projectile[j].ConditionEffect._,
                duration: current.Projectile[j].ConditionEffect.duration,
              });
            }
          }
        } else if (typeof current.Projectile === 'object') {
          this.objects[+current.type].projectile = {
            id: +current.Projectile.id,
            objectId: current.Projectile.ObjectId,
            damage: isNaN(current.Projectile.damage) ? -1 : +current.Projectile.damage,
            armorPiercing: current.Projectile.ArmorPiercing === '',
            minDamage: isNaN(current.Projectile.MinDamage) ? -1 : +current.Projectile.MinDamage,
            maxDamage: isNaN(current.Projectile.MaxDamage) ? -1 : +current.Projectile.MaxDamage,
            speed: +current.Projectile.Speed,
            lifetimeMS: +current.Projectile.LifetimeMS,
            parametric: current.Projectile.Parametric === '',
            wavy: current.Projectile.Wavy === '',
            boomerang: current.Projectile.Boomerang === '',
            multiHit: current.Projectile.MultiHit === '',
            passesCover: current.Projectile.PassesCover === '',
            frequency: isNaN(current.Projectile.Frequency) ? 1 : +current.Projectile.Frequency,
            amplitude: isNaN(current.Projectile.Amplitude) ? 0 : +current.Projectile.Amplitude,
            magnitude: isNaN(current.Projectile.Magnitude) ? 3 : +current.Projectile.Magnitude,
            conditionEffects: [],
          };
          this.objects[+current.type].projectiles.push(this.objects[+current.type].projectile);
        }
        // map items.
        if (this.objects[+current.type].item) {
          // stat bonuses
          if (Array.isArray(current.ActivateOnEquip)) {
            for (const bonus of current.ActivateOnEquip) {
              if (bonus._ === 'IncrementStat') {
                this.objects[+current.type].activateOnEquip.push({
                  statType: bonus.stat,
                  amount: bonus.amount,
                });
              }
            }
          } else if (typeof current.ActivateOnEquip === 'object') {
            if (current.ActivateOnEquip._ === 'IncrementStat') {
              this.objects[+current.type].activateOnEquip.push({
                statType: current.ActivateOnEquip.stat,
                amount: current.ActivateOnEquip.amount,
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
