// tslint:disable-next-line: max-line-length
import { AoeAckPacket, AoePacket, CreatePacket, CreateSuccessPacket, DamagePacket, DeathPacket, EnemyHitPacket, EnemyShootPacket, FailureCode, FailurePacket, GotoAckPacket, GotoPacket, GroundDamagePacket, GroundTileData, HelloPacket, LoadPacket, MapInfoPacket, MovePacket, NewTickPacket, NotificationPacket, OtherHitPacket, Packet, PacketIO, PingPacket, PlayerHitPacket, PlayerShootPacket, Point, PongPacket, ReconnectPacket, ServerPlayerShootPacket, ShootAckPacket, StatType, UpdateAckPacket, UpdatePacket, WorldPosData } from '@realmlib/net';
import { Socket } from 'net';
import * as rsa from '../crypto/rsa';
import { Entity } from '../models/entity';
import { Events } from '../models/events';
import { GameId } from '../models/game-ids';
import { MapTile } from '../models/map-tile';
import { Runtime } from '../runtime/runtime';
import { getWaitTime } from '../runtime/scheduler';
import { Logger, LogLevel, Random } from '../services';
import { NodeUpdate, Pathfinder } from '../services/pathfinding';
import { insideSquare } from '../util/math-util';
import { delay } from '../util/misc-util';
import { createConnection } from '../util/net-util';
import * as parsers from '../util/parsers';
import { getHooks, PacketHook } from './../decorators';
// tslint:disable-next-line: max-line-length
import { Account, CharacterInfo, Classes, ConditionEffect, Enemy, getDefaultPlayerData, hasEffect, MapInfo, MoveRecords, PlayerData, Projectile, Proxy, Server } from './../models';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;
const MIN_ATTACK_FREQ = 0.0015;
const MAX_ATTACK_FREQ = 0.008;
const MIN_ATTACK_MULT = 0.5;
const MAX_ATTACK_MULT = 2;
const ACC_IN_USE = /Account in use \((\d+) seconds? until timeout\)/;

export class Client {

  /**
   * The player data of the client.
   * @see `PlayerData` for more info.
   */
  playerData: PlayerData;
  /**
   * The objectId of the client.
   */
  objectId: number;
  /**
   * The current position of the client.
   */
  worldPos: WorldPosData;
  /**
   * The PacketIO instance associated with the client.
   * @see `PacketIO` for more info.
   */
  io: PacketIO;
  /**
   * The tiles of the current map. These are stored in a
   * 1d array, so to access the tile at x, y the index
   * y * height + x should be used where height is the height
   * of the map.
   * @example
   * ```
   * getTile(client: Client, x: number, y: number): MapTile {
   *   const tileX = Math.floor(x);
   *   const tileY = Math.floor(y);
   *   return client.mapTiles.mapTiles[tileY * client.mapInfo.height + tileX];
   * }
   * ```
   */
  mapTiles: MapTile[];
  /**
   * A queue of positions for the client to move towards. If
   * the queue is not empty, the client will move towards the first
   * item in it. The first item will be removed when the client has reached it.
   * @example
   * ```
   * const pos: WorldPosData = client.worldPos.clone();
   * pos.x += 1;
   * pos.y += 1;
   * client.nextPos.push(pos);
   * ```
   */
  readonly nextPos: WorldPosData[];
  /**
   * Info about the current map.
   * @see `MapInfo` for more information.
   */
  mapInfo: MapInfo;
  /**
   * Info about the account's characters.
   * @see `CharacterInfo` for more information.
   */
  readonly charInfo: CharacterInfo;
  /**
   * The server the client is connected to.
   * @see `Server` for more info.
   */
  get server(): Server {
    return this.internalServer;
  }
  /**
   * The alias of the client.
   */
  alias: string;
  /**
   * The email address of the client.
   */
  readonly guid: string;
  /**
   * The password of the client.
   */
  readonly password: string;
  /**
   * The runtime in which this client is running.
   */
  readonly runtime: Runtime;
  /**
   * Whether or not the client should automatically shoot at enemies.
   */
  autoAim: boolean;
  /**
   * A number between 0 and 1 which can be used to modify the speed
   * of the client. A value of 1 will be 100% move speed for the client,
   * a value of 0.5 will be 50% of the max speed. etc.
   *
   * @example
   * client.moveMultiplier = 0.8;
   */
  set moveMultiplier(value: number) {
    this.internalMoveMultiplier = Math.max(0, Math.min(value, 1));
  }
  get moveMultiplier(): number {
    return this.internalMoveMultiplier;
  }

  /**
   * A number between 0 and 1 which represents the percentage of health
   * at which the client will escape to the Nexus.
   * A value of 0.5 will be 50% of the max health.
   */
  set autoNexusThreshold(value: number) {
    this.internalAutoNexusThreshold = Math.max(0, Math.min(value, 1));
  }
  get autoNexusThreshold(): number {
    return this.internalAutoNexusThreshold;
  }
  /**
   * Indicates whether or not the client's TCP socket is connected.
   */
  get connected(): boolean {
    return this.socketConnected;
  }

  /**
   * The current game id of this client.
   */
  get gameId(): GameId {
    return this.internalGameId;
  }

  private socketConnected: boolean;
  private internalMoveMultiplier: number;
  private internalAutoNexusThreshold: number;

  private nexusServer: Server;
  private internalServer: Server;
  private lastTickTime: number;
  private lastTickId: number;
  private currentTickTime: number;
  private lastFrameTime: number;
  private connectTime: number;
  private buildVersion: string;
  private clientSocket: Socket;
  private proxy: Proxy;
  private currentBulletId: number;
  private lastAttackTime: number;
  private pathfinder: Pathfinder;
  private pathfinderEnabled: boolean;
  private pathfinderTarget: Point;
  private moveRecords: MoveRecords;
  private frameUpdateTimer: NodeJS.Timer;
  private needsNewCharacter: boolean;

  // reconnect info
  private key: number[];
  private keyTime: number;
  private internalGameId: GameId;
  private reconnectCooldown: number;

  // enemies/projeciles
  private projectiles: Projectile[];
  private random: Random;
  private enemies: Map<number, Enemy>;
  private players: Map<number, Entity>;
  private hasPet: boolean;

  // movement vars
  private tileMultiplier: number;

  // client hp vars
  private clientHP: number;
  private hpLog: number;
  private safeMap: boolean;

  /**
   * Creates a new instance of the client and begins the connection process to the specified server.
   * @param server The server to connect to.
   * @param buildVersion The current build version of RotMG.
   * @param accInfo The account info to connect with.
   */
  constructor(runtime: Runtime, server: Server, accInfo: Account) {
    this.runtime = runtime;
    this.projectiles = [];
    this.enemies = new Map();
    this.players = new Map();
    this.autoAim = true;
    this.key = [];
    this.keyTime = -1;
    this.internalGameId = GameId.Nexus;
    this.playerData = getDefaultPlayerData();
    this.playerData.server = server.name;
    this.nextPos = [];
    this.internalMoveMultiplier = 1;
    this.tileMultiplier = 1;
    this.internalAutoNexusThreshold = 0.3;
    this.currentBulletId = 1;
    this.lastAttackTime = 0;
    this.hasPet = false;
    this.safeMap = true;
    this.hpLog = 0;
    this.clientHP = 0;
    this.connectTime = Date.now();
    this.socketConnected = false;
    this.guid = accInfo.guid;
    this.password = accInfo.password;
    this.buildVersion = this.runtime.buildVersion;
    this.alias = accInfo.alias;
    this.proxy = accInfo.proxy;
    this.reconnectCooldown = getWaitTime(this.proxy ? this.proxy.host : '');
    this.pathfinderEnabled = accInfo.pathfinder || false;
    if (accInfo.charInfo) {
      this.charInfo = accInfo.charInfo;
    } else {
      this.charInfo = { charId: 0, nextCharId: 1, maxNumChars: 1 };
    }
    this.needsNewCharacter = this.charInfo.charId === 0;
    this.internalServer = Object.assign({}, server);
    this.nexusServer = Object.assign({}, server);

    this.io = new PacketIO({ packetMap: this.runtime.packetMap });

    // use a set here to eliminate duplicates.
    const requiredHooks = new Set(getHooks().map((hook) => hook.packet));
    for (const type of requiredHooks) {
      this.io.on(type, (data: Packet) => {
        this.runtime.libraryManager.callHooks(data, this);
      });
    }
    this.io.on('error', (err: Error) => {
      Logger.log(this.alias, `Received PacketIO error: ${err.message}`, LogLevel.Error);
      Logger.log(this.alias, err.stack, LogLevel.Debug);
    });

    Logger.log(this.alias, `Starting connection to ${server.name}`, LogLevel.Info);
    this.connect();
  }

  /**
   * Shoots a projectile at the specified angle.
   * @param angle The angle in radians to shoot towards.
   */
  shoot(angle: number): boolean {
    // tslint:disable-next-line: no-bitwise
    if (hasEffect(this.playerData.condition, ConditionEffect.STUNNED | ConditionEffect.PAUSED)) {
      return false;
    }
    const time = this.getTime();
    const item = this.runtime.resources.items[this.playerData.inventory[0]];
    const attackPeriod = 1 / this.getAttackFrequency() * (1 / item.rateOfFire);
    const numProjectiles = item.numProjectiles > 0 ? item.numProjectiles : 1;
    if (time < this.lastAttackTime + attackPeriod) {
      return false;
    }
    this.lastAttackTime = time;
    const arcRads = item.arcGap * Math.PI / 180;
    let totalArc = arcRads * (numProjectiles - 1);
    if (arcRads <= 0) {
      totalArc = 0;
    }
    angle -= totalArc / 2;
    for (let i = 0; i < numProjectiles; i++) {
      const shootPacket = new PlayerShootPacket();
      shootPacket.bulletId = this.getBulletId();
      shootPacket.angle = angle;
      shootPacket.containerType = item.type;
      shootPacket.time = time;
      shootPacket.startingPos = this.worldPos.clone();
      shootPacket.startingPos.x += (Math.cos(angle) * 0.3);
      shootPacket.startingPos.y += (Math.sin(angle) * 0.3);
      this.send(shootPacket);
      const containerProps = this.runtime.resources.objects[item.type];
      const newProj = new Projectile(
        item.type,
        containerProps,
        0,
        this.objectId,
        shootPacket.bulletId,
        angle,
        time,
        {
          x: shootPacket.startingPos.x,
          y: shootPacket.startingPos.y,
        },
      );
      this.projectiles.unshift(newProj);
      if (arcRads > 0) {
        angle += arcRads;
      }

      const projectile = item.projectile;
      let damage = this.random.nextIntInRange(projectile.minDamage, projectile.maxDamage);
      if (time > this.moveRecords.lastClearTime + 600) {
        damage = 0;
      }
      newProj.setDamage(damage * this.getAttackMultiplier());
    }

    return true;
  }

  /**
   * Removes all event listeners and releases any resources held by the client.
   * This should only be used when the client is no longer needed.
   */
  destroy(): void {
    // packet io.
    if (this.io) {
      this.io.detach();
    }

    // timers.
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
    }

    if (this.socketConnected) {
      this.socketConnected = false;
      this.runtime.emit(Events.ClientDisconnect, this);
    }

    // client socket.
    if (this.clientSocket) {
      this.clientSocket.removeAllListeners('close');
      this.clientSocket.removeAllListeners('error');
      this.clientSocket.destroy();
    }

    // resources.
    // if we're unlucky, a packet hook, or onFrame was called and preempted this method.
    // to avoid a nasty race condition, release these resources on the next tick after
    // the io has been detached and the frame timers have been stopped.
    process.nextTick(() => {
      this.mapTiles = undefined;
      this.projectiles = undefined;
      this.enemies = undefined;
      this.io = undefined;
      this.clientSocket = undefined;
    });
  }

  /**
   * Switches the client connect to a proxied connection. Setting this to
   * `undefined` will remove the current proxy if there is one.
   * @param proxy The proxy to use.
   */
  setProxy(proxy: Proxy): void {
    if (proxy) {
      Logger.log(this.alias, 'Connecting to new proxy.');
    } else {
      Logger.log(this.alias, 'Connecting without proxy.');
    }
    this.proxy = proxy;
    this.connect();
  }

  /**
   * Connects the bot to the `server`.
   * @param server The server to connect to.
   * @param gameId An optional game id to use when connecting. Defaults to the current game id.
   */
  connectToServer(server: Server, gameId = this.internalGameId): void {
    Logger.log(this.alias, `Switching to ${server.name}.`, LogLevel.Info);
    this.internalServer = Object.assign({}, server);
    this.nexusServer = Object.assign({}, server);
    this.internalGameId = gameId;
    this.connect();
  }

  /**
   * Connects to the Nexus.
   */
  connectToNexus(): void {
    Logger.log(this.alias, 'Connecting to the Nexus.', LogLevel.Info);
    this.internalGameId = GameId.Nexus;
    this.internalServer = Object.assign({}, this.nexusServer);
    this.connect();
  }

  /**
   * Connects to `gameId` on the current server
   *  @param gameId The gameId to use upon connecting.
   */
  changeGameId(gameId: GameId): void {
    Logger.log(this.alias, `Changing gameId to ${gameId}`, LogLevel.Info);
    this.internalGameId = gameId;
    this.connect();
  }

  /**
   * Returns how long the client has been connected for, in milliseconds.
   */
  getTime(): number {
    return Date.now() - this.connectTime;
  }

  /**
   * Finds a path from the client's current position to the `to` point
   * and moves the client along the path.
   * @param to The point to navigate towards.
   */
  findPath(to: Point): void {
    if (!this.pathfinderEnabled) {
      Logger.log(this.alias, 'Pathfinding is not enabled. Please enable it in the acc-config.', LogLevel.Warning);
      return;
    }
    to.x = Math.floor(to.x);
    to.y = Math.floor(to.y);
    this.pathfinder.findPath(this.worldPos, to).then((path) => {
      if (path.length === 0) {
        this.pathfinderTarget = undefined;
        this.nextPos.length = 0;
        return;
      }
      this.pathfinderTarget = to;
      this.nextPos.length = 0;
      this.nextPos.push(...path.map((p) => new WorldPosData(p.x + 0.5, p.y + 0.5)));
    }).catch((error: Error) => {
      Logger.log(this.alias, `Error finding path: ${error.message}`, LogLevel.Error);
      Logger.log(this.alias, error.stack, LogLevel.Debug);
    });
  }

  /**
   * Applies some damage and returns whether or not the client should
   * return to the nexus.
   * @param amount The amount of damage to apply.
   * @param armorPiercing Whether or not the damage should be armor piercing.
   */
  private applyDamage(amount: number, armorPiercing: boolean, time: number): boolean {
    if (time === -1) {
      time = this.getTime();
    }

    // if the player is currently invincible, they take no damage.
    // tslint:disable-next-line: no-bitwise
    const invincible = ConditionEffect.INVINCIBLE | ConditionEffect.INVULNERABLE | ConditionEffect.PAUSED;
    if (hasEffect(this.playerData.condition, invincible)) {
      return false;
    }

    // work out the defense.
    let def = this.playerData.def;
    if (hasEffect(this.playerData.condition, ConditionEffect.ARMORED)) {
      def *= 2;
    }
    if (armorPiercing || hasEffect(this.playerData.condition, ConditionEffect.ARMORBROKEN)) {
      def = 0;
    }

    // work out the actual damage.
    const min = amount * 3 / 20;
    const actualDamage = Math.max(min, amount - def);

    // apply it and check for autonexusing.
    this.playerData.hp -= actualDamage;
    this.clientHP -= actualDamage;
    Logger.log(this.alias, `Took ${actualDamage.toFixed(0)} damage. At ${this.clientHP.toFixed(0)} health.`);
    return this.checkHealth(time);
  }

  private checkProjectiles(time: number): void {
    // iterate backwards so that removing an item won't skip any projectiles.
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (!this.projectiles[i].update(this.getTime())) {
        this.projectiles.splice(i, 1);
        continue;
      }
      if (this.projectiles[i].damagePlayers) {
        // check if it hit a wall.
        const x = Math.floor(this.projectiles[i].currentPosition.x);
        const y = Math.floor(this.projectiles[i].currentPosition.y);

        const tileOccupied =
          this.mapTiles[y * this.mapInfo.width + x]
          && this.mapTiles[y * this.mapInfo.width + x].occupied;
        if (tileOccupied && !this.projectiles[i].projectileProperties.passesCover) {
          const otherHit = new OtherHitPacket();
          otherHit.bulletId = this.projectiles[i].bulletId;
          otherHit.objectId = this.projectiles[i].ownerObjectId;
          otherHit.targetId = this.mapTiles[y * this.mapInfo.width + x].occupiedBy;
          otherHit.time = this.getTime();
          this.send(otherHit);
          this.projectiles.splice(i, 1);
          Logger.log(this.alias, 'Sent OtherHit for object.', LogLevel.Debug);
          continue;
        }

        // check if it hit the player.
        if (insideSquare(this.projectiles[i].currentPosition, this.worldPos, 0.5)) {
          // make sure we aren't applying damage twice.
          const alreadyHit =
            this.projectiles[i].projectileProperties.multiHit
            && this.projectiles[i].multiHit.has(this.objectId);
          if (!alreadyHit) {
            // apply the hit damage.
            const nexused = this.applyDamage(
              this.projectiles[i].damage,
              this.projectiles[i].projectileProperties.armorPiercing,
              time,
            );
            // only reply if we didn't get nexused.
            if (!nexused) {
              const playerHit = new PlayerHitPacket();
              playerHit.bulletId = this.projectiles[i].bulletId;
              playerHit.objectId = this.projectiles[i].ownerObjectId;
              this.send(playerHit);
              Logger.log(this.alias, 'Sent PlayerHit.', LogLevel.Debug);
            }
            if (this.projectiles[i].projectileProperties.multiHit) {
              this.projectiles[i].multiHit.add(this.objectId);
            } else {
              this.projectiles.splice(i, 1);
            }
            continue;
          }
        }

        // check if it hit another player.
        if (this.players.size > 0) {
          // find the closest player.
          let closestPlayer: [number, Entity] = [Infinity, undefined];
          for (const player of this.players.values()) {
            const alreadyHit =
              this.projectiles[i].projectileProperties.multiHit
              && this.projectiles[i].multiHit.has(player.objectData.objectId);
            if (alreadyHit) {
              continue;
            }
            const distance = player.squareDistanceTo(this.projectiles[i].currentPosition);
            if (distance < closestPlayer[0] && !hasEffect(player.objectData.condition, ConditionEffect.PAUSED)) {
              closestPlayer = [distance, player];
            }
          }
          // if there is a player...
          if (closestPlayer[1] !== undefined) {
            // ...and they are less than 0.5 tiles away, hit them.
            // TODO: check multiHit property.
            if (insideSquare(this.projectiles[i].currentPosition, closestPlayer[1].currentPos, 0.5)) {
              if (this.projectiles[i].projectileProperties.multiHit) {
                this.projectiles[i].multiHit.add(closestPlayer[1].objectData.objectId);
              } else {
                const otherHit = new OtherHitPacket();
                otherHit.bulletId = this.projectiles[i].bulletId;
                otherHit.objectId = this.projectiles[i].ownerObjectId;
                otherHit.targetId = closestPlayer[1].objectData.objectId;
                otherHit.time = this.getTime();
                this.send(otherHit);
                this.projectiles.splice(i, 1);
                Logger.log(this.alias, `Sent OtherHit for player: ${closestPlayer[1].objectData.name}`, LogLevel.Debug);
              }
            }
          }
        }
      } else {
        // find the closest enemy.
        let closestEnemy: [number, Enemy] = [Infinity, undefined];
        for (const enemy of this.enemies.values()) {
          const alreadyHit =
            this.projectiles[i].projectileProperties.multiHit
            && this.projectiles[i].multiHit.has(enemy.objectData.objectId);
          if (alreadyHit) {
            continue;
          }
          const dist = enemy.squareDistanceTo(this.projectiles[i].currentPosition);
          if (dist < closestEnemy[0] && !enemy.dead) {
            closestEnemy = [dist, enemy];
          }
        }

        // if there is an enemy...
        if (closestEnemy[1] !== undefined) {
          // ...and they are less than 0.5 tiles away, hit them.
          if (insideSquare(this.projectiles[i].currentPosition, closestEnemy[1].currentPos, 0.5)) {
            const enemyHit = new EnemyHitPacket();
            const piercing = this.projectiles[i].projectileProperties.armorPiercing;
            const damage = closestEnemy[1].damage(this.projectiles[i].damage, piercing);
            enemyHit.bulletId = this.projectiles[i].bulletId;
            enemyHit.targetId = closestEnemy[1].objectData.objectId;
            enemyHit.time = this.getTime();
            enemyHit.kill = closestEnemy[1].objectData.hp <= damage;
            this.send(enemyHit);
            Logger.log(
              this.alias,
              `Sent EnemyHit (kill = ${enemyHit.kill}) (id = ${enemyHit.targetId})`,
              LogLevel.Debug,
            );
            if (this.projectiles[i].projectileProperties.multiHit) {
              this.projectiles[i].multiHit.add(closestEnemy[1].objectData.objectId);
            } else {
              this.projectiles.splice(i, 1);
            }
            if (enemyHit.kill) {
              closestEnemy[1].dead = true;
            }
          }
        }
      }
    }
  }

  /**
   * Checks whether or not the client should take damage from
   * the tile they are currently standing on.
   */
  private checkGroundDamage(time: number): void {
    const x = Math.floor(this.worldPos.x);
    const y = Math.floor(this.worldPos.y);
    const tile = this.mapTiles[y * this.mapInfo.width + x];

    // if there is no tile, return.
    if (!tile) {
      return;
    }

    // don't damage if the last damage was less than 500 ms ago.
    const now = this.getTime();
    if (tile.lastDamage + 500 > now) {
      return;
    }

    // don't damage if the tile is protected from ground damage.
    if (tile.protectFromGroundDamage) {
      return;
    }

    // if the tile actually does damage.
    const props = this.runtime.resources.tiles[tile.type];
    if (props.minDamage !== undefined && props.maxDamage !== undefined) {
      // get the damage.
      const damage = this.random.nextIntInRange(props.minDamage, props.maxDamage);
      tile.lastDamage = now;

      // apply it and only send the response if the client didn't nexus.
      const nexused = this.applyDamage(damage, true, time);
      if (!nexused) {
        const groundDamage = new GroundDamagePacket();
        groundDamage.time = now;
        groundDamage.position = this.worldPos.clone();
        this.send(groundDamage);
      }
    }
  }

  @PacketHook()
  private onDamage(damage: DamagePacket): void {
    // remove the projectile if it's in our list.
    // TODO: handle multi hit
    this.projectiles = this.projectiles
      .filter((p) => damage.objectId !== p.ownerObjectId || damage.bulletId !== p.bulletId);

    // if the bullet hit an enemy, do damage to that enemy
    if (this.enemies.has(damage.targetId)) {
      const enemy = this.enemies.get(damage.targetId);
      if (damage.kill) {
        enemy.dead = true;
      }
    }
  }

  @PacketHook()
  private onMapInfo(mapInfoPacket: MapInfoPacket): void {
    this.safeMap = mapInfoPacket.name === 'Nexus';
    if (this.needsNewCharacter) {
      const createPacket = new CreatePacket();
      createPacket.classType = Classes.Wizard;
      createPacket.skinType = 0;
      Logger.log(this.alias, 'Creating new character', LogLevel.Info);
      this.send(createPacket);
      this.needsNewCharacter = false;
    } else {
      const loadPacket = new LoadPacket();
      loadPacket.charId = this.charInfo.charId;
      loadPacket.isFromArena = false;
      Logger.log(this.alias, `Connecting to ${mapInfoPacket.name}`, LogLevel.Info);
      this.send(loadPacket);
    }
    this.random = new Random(mapInfoPacket.fp);
    this.mapTiles = [];
    this.mapInfo = { width: mapInfoPacket.width, height: mapInfoPacket.height, name: mapInfoPacket.name };
    if (this.pathfinderEnabled) {
      this.pathfinder = new Pathfinder(mapInfoPacket.width);
    }
  }

  @PacketHook()
  private onDeath(deathPacket: DeathPacket): void {
    // if it isn't us that died, nothing to do.
    if (deathPacket.accountId !== this.playerData.accountId) {
      return;
    }

    Logger.log(this.alias, `The character ${deathPacket.charId} has died.`, LogLevel.Warning);

    // update the char info.
    this.charInfo.charId = this.charInfo.nextCharId;
    this.charInfo.nextCharId++;
    this.needsNewCharacter = true;

    // update the char info cache.
    this.runtime.accountService.updateCharInfoCache(this.guid, this.charInfo);

    Logger.log(this.alias, 'Connecting to the nexus.', LogLevel.Info);
    // reconnect to the nexus.
    this.connectToNexus();
  }

  @PacketHook()
  private onNotification(notification: NotificationPacket): void {
    if (notification.objectId !== this.objectId) {
      return;
    }
    try {
      const json = JSON.parse(notification.message);
      if (json.key === 'server.plus_symbol' && notification.color === 0x00ff00) {
        const healAmount = parseInt(json.tokens.amount, 10);
        this.addHealth(healAmount);
      }
    } catch {
      Logger.log(this.alias, `Received non-json notification: "${notification.message}"`, LogLevel.Debug);
    }
  }

  @PacketHook()
  private onUpdate(updatePacket: UpdatePacket): void {
    // reply
    const updateAck = new UpdateAckPacket();
    this.send(updateAck);

    const pathfinderUpdates: NodeUpdate[] = [];
    // playerdata
    for (const obj of updatePacket.newObjects) {
      if (obj.status.objectId === this.objectId) {
        for (const stat of obj.status.stats) {
          if (stat.statType === StatType.HP_STAT) {
            this.clientHP = stat.statValue;
            break;
          }
        }
        this.worldPos = obj.status.pos;
        this.playerData = parsers.processObject(obj);
        this.playerData.server = this.internalServer.name;
        continue;
      }
      if (obj.status.objectId === this.objectId + 1) {
        if (this.runtime.resources.pets[obj.objectType] !== undefined) {
          Logger.log(this.alias, 'Detected pet.', LogLevel.Debug);
          this.hasPet = true;
        }
      }
      if (Classes[obj.objectType]) {
        const player = new Entity(obj.status);
        this.players.set(obj.status.objectId, player);
        continue;
      }
      if (this.runtime.resources.objects[obj.objectType]) {
        const gameObject = this.runtime.resources.objects[obj.objectType];
        if (gameObject.enemy) {
          if (!this.enemies.has(obj.status.objectId)) {
            this.enemies.set(obj.status.objectId, new Enemy(gameObject, obj.status));
          }
          continue;
        }
        if (gameObject.fullOccupy || gameObject.occupySquare) {
          const index = Math.floor(obj.status.pos.y) * this.mapInfo.width + Math.floor(obj.status.pos.x);
          if (!this.mapTiles[index]) {
            this.mapTiles[index] = new GroundTileData() as MapTile;
          }
          this.mapTiles[index].occupied = true;
          this.mapTiles[index].occupiedBy = obj.status.objectId;
        }
        if (gameObject.protectFromGroundDamage) {
          const index = Math.floor(obj.status.pos.y) * this.mapInfo.width + Math.floor(obj.status.pos.x);
          if (!this.mapTiles[index]) {
            this.mapTiles[index] = new GroundTileData() as MapTile;
          }
          this.mapTiles[index].protectFromGroundDamage = true;
        }
        if (this.pathfinderEnabled) {
          if (gameObject.fullOccupy || gameObject.occupySquare) {
            const x = obj.status.pos.x;
            const y = obj.status.pos.y;
            pathfinderUpdates.push({
              x: Math.floor(x),
              y: Math.floor(y),
              walkable: false,
            });
          }
        }
      }
    }

    // map tiles
    for (const tile of updatePacket.tiles) {
      const index = tile.y * this.mapInfo.width + tile.x;
      if (!this.mapTiles[index]) {
        this.mapTiles[index] = {
          ...tile,
          read: tile.read,
          write: tile.write,
          occupied: false,
          occupiedBy: undefined,
          lastDamage: 0,
          protectFromGroundDamage: false,
        };
      } else {
        this.mapTiles[index].x = tile.x;
        this.mapTiles[index].y = tile.y;
      }

      if (this.pathfinderEnabled) {
        if (this.runtime.resources.tiles[tile.type].noWalk) {
          pathfinderUpdates.push({
            x: Math.floor(tile.x),
            y: Math.floor(tile.y),
            walkable: false,
          });
        }
      }
    }

    // drops
    for (const drop of updatePacket.drops) {
      if (this.enemies.has(drop)) {
        this.enemies.delete(drop);
      }
      if (this.players.has(drop)) {
        this.players.delete(drop);
      }
    }

    if (pathfinderUpdates.length > 0 && this.pathfinderEnabled) {
      this.pathfinder.updateWalkableNodes(pathfinderUpdates);
      if (this.pathfinderTarget) {
        this.findPath(this.pathfinderTarget);
      }
    }
  }

  @PacketHook()
  private onReconnectPacket(reconnectPacket: ReconnectPacket): void {
    // if there is a new host, then switch to it.
    if (reconnectPacket.host !== '') {
      this.internalServer.address = reconnectPacket.host;
    }
    // same story with the name.
    if (reconnectPacket.name !== '') {
      this.internalServer.name = reconnectPacket.name;
    }
    this.internalGameId = reconnectPacket.gameId;
    this.key = reconnectPacket.key;
    this.keyTime = reconnectPacket.keyTime;
    this.connect();
  }

  @PacketHook()
  private onGotoPacket(gotoPacket: GotoPacket): void {
    const ack = new GotoAckPacket();
    ack.time = this.lastFrameTime;
    this.send(ack);
    if (gotoPacket.objectId === this.objectId) {
      this.worldPos = gotoPacket.position.clone();
    }
    if (this.enemies.has(gotoPacket.objectId)) {
      this.enemies.get(gotoPacket.objectId).onGoto(gotoPacket.position.x, gotoPacket.position.y, this.lastFrameTime);
    }
    if (this.players.has(gotoPacket.objectId)) {
      this.players.get(gotoPacket.objectId).onGoto(gotoPacket.position.x, gotoPacket.position.y, this.lastFrameTime);
    }
  }

  @PacketHook()
  private onFailurePacket(failurePacket: FailurePacket): void {
    switch (failurePacket.errorId) {
      case FailureCode.IncorrectVersion:
        Logger.log(this.alias, 'buildVersion out of date. Updating and reconnecting...');
        this.buildVersion = failurePacket.errorDescription;
        this.runtime.updateBuildVersion(failurePacket.errorDescription);
        break;
      case FailureCode.InvalidTeleportTarget:
        Logger.log(this.alias, 'Invalid teleport target.', LogLevel.Warning);
        break;
      case FailureCode.EmailVerificationNeeded:
        Logger.log(this.alias, 'Email verification is required for this account.', LogLevel.Error);
        break;
      case FailureCode.BadKey:
        Logger.log(this.alias, 'Invalid key used.', LogLevel.Error);
        this.key = [];
        this.internalGameId = GameId.Nexus;
        this.keyTime = -1;
        break;
      default:
        switch (failurePacket.errorDescription) {
          case 'Character is dead':
            this.fixCharInfoCache();
            break;
          case 'Character not found':
            Logger.log(this.alias, 'No active characters. Creating new character.', LogLevel.Info);
            this.needsNewCharacter = true;
            break;
          default:
            Logger.log(
              this.alias,
              `Received failure ${failurePacket.errorId}: "${failurePacket.errorDescription}"`,
              LogLevel.Error,
            );
            if (ACC_IN_USE.test(failurePacket.errorDescription)) {
              const timeout: any = ACC_IN_USE.exec(failurePacket.errorDescription)[1];
              if (!isNaN(timeout)) {
                this.reconnectCooldown = parseInt(timeout, 10) * 1000;
              }
            }
            break;
        }
        break;
    }
  }

  @PacketHook()
  private onAoe(aoePacket: AoePacket): void {
    const aoeAck = new AoeAckPacket();
    aoeAck.time = this.lastFrameTime;
    aoeAck.position = this.worldPos.clone();
    let nexused = false;
    if (aoePacket.pos.squareDistanceTo(this.worldPos) < aoePacket.radius ** 2) {
      // apply the aoe damage if in range.
      nexused = this.applyDamage(aoePacket.damage, aoePacket.armorPiercing, this.getTime());
    }
    // only reply if the client didn't nexus.
    if (!nexused) {
      this.send(aoeAck);
    }
  }

  @PacketHook()
  private onNewTick(newTickPacket: NewTickPacket): void {
    this.lastTickTime = this.currentTickTime;
    this.lastTickId = newTickPacket.tickId;
    this.currentTickTime = this.getTime();
    // reply
    const movePacket = new MovePacket();
    movePacket.tickId = newTickPacket.tickId;
    movePacket.time = this.lastFrameTime;
    movePacket.newPosition = this.worldPos;
    movePacket.records = [];
    const lastClear = this.moveRecords.lastClearTime;
    if (lastClear >= 0 && movePacket.time - lastClear > 125) {
      const len = Math.min(10, this.moveRecords.records.length);
      for (let i = 0; i < len; i++) {
        if (this.moveRecords.records[i].time >= movePacket.time - 25) {
          break;
        }
        movePacket.records.push(this.moveRecords.records[i].clone());
      }
    }
    this.moveRecords.clear(movePacket.time);
    this.send(movePacket);

    const x = Math.floor(this.worldPos.x);
    const y = Math.floor(this.worldPos.y);
    if (
      this.mapTiles[y * this.mapInfo.width + x]
      && this.runtime.resources.tiles[this.mapTiles[y * this.mapInfo.width + x].type]
    ) {
      this.tileMultiplier = this.runtime.resources.tiles[this.mapTiles[y * this.mapInfo.width + x].type].speed;
    }

    const elapsedMS = this.currentTickTime - this.lastTickTime;

    for (const status of newTickPacket.statuses) {
      if (status.objectId === this.objectId) {
        this.playerData = parsers.processStatData(status.stats, this.playerData);
        this.playerData.objectId = this.objectId;
        this.playerData.worldPos = this.worldPos;
        this.playerData.server = this.internalServer.name;
        continue;
      }
      if (this.enemies.has(status.objectId)) {
        this.enemies.get(status.objectId).onNewTick(status, elapsedMS, newTickPacket.tickId, this.lastFrameTime);
        continue;
      }
      if (this.players.has(status.objectId)) {
        this.players.get(status.objectId).onNewTick(status, elapsedMS, newTickPacket.tickId, this.lastFrameTime);
      }
    }

    if (this.autoAim && this.playerData.inventory[0] !== -1 && this.enemies.size > 0) {
      const projectile = this.runtime.resources.items[this.playerData.inventory[0]].projectile;
      const distance = projectile.lifetimeMS * (projectile.speed / 10000);
      for (const enemy of this.enemies.values()) {
        if (enemy.squareDistanceTo(this.worldPos) < distance ** 2) {
          const x = enemy.objectData.worldPos.x - this.worldPos.x;
          const y = enemy.objectData.worldPos.y - this.worldPos.y;
          const angle = Math.atan2(y, x);
          this.shoot(angle);
        }
      }
    }
  }

  @PacketHook()
  private onPing(pingPacket: PingPacket): void {
    // reply
    const pongPacket = new PongPacket();
    pongPacket.serial = pingPacket.serial;
    pongPacket.time = this.getTime();
    this.send(pongPacket);
  }

  @PacketHook()
  private onEnemyShoot(enemyShootPacket: EnemyShootPacket): void {
    const shootAck = new ShootAckPacket();
    shootAck.time = this.lastFrameTime;
    const owner = this.enemies.get(enemyShootPacket.ownerId);
    if (!owner || owner.dead) {
      shootAck.time = -1;
    }
    this.send(shootAck);
    if (!owner || owner.dead) {
      return;
    }
    for (let i = 0; i < enemyShootPacket.numShots; i++) {
      const projectile = new Projectile(
        owner.properties.type,
        this.runtime.resources.objects[owner.properties.type],
        enemyShootPacket.bulletType,
        enemyShootPacket.ownerId,
        (enemyShootPacket.bulletId + i) % 256,
        enemyShootPacket.angle + i * enemyShootPacket.angleInc,
        this.lastFrameTime,
        enemyShootPacket.startingPos,
      );
      projectile.setDamage(enemyShootPacket.damage);
      this.projectiles.unshift(projectile);
    }
  }

  @PacketHook()
  private onServerPlayerShoot(serverPlayerShoot: ServerPlayerShootPacket): void {
    if (serverPlayerShoot.ownerId === this.objectId) {
      const ack = new ShootAckPacket();
      if (this.hasPet) {
        ack.time = this.lastFrameTime;
      } else {
        ack.time = -1;
      }
      this.send(ack);
    }
  }

  @PacketHook()
  private onCreateSuccess(createSuccessPacket: CreateSuccessPacket): void {
    Logger.log(this.alias, 'Connected!', LogLevel.Success);
    this.objectId = createSuccessPacket.objectId;
    this.charInfo.charId = createSuccessPacket.charId;
    this.charInfo.nextCharId = this.charInfo.charId + 1;
    this.lastFrameTime = this.getTime();
    this.runtime.emit(Events.ClientReady, this);
    this.frameUpdateTimer = setInterval(this.onFrame.bind(this), 1000 / 30);
  }

  private onFrame() {
    const time = this.getTime();
    const delta = time - this.lastFrameTime;
    this.calcHealth(delta);
    if (this.checkHealth(time)) {
      return;
    }
    if (this.nextPos.length > 0) {
      /**
       * We don't want to move further than we are allowed to, so if the
       * timer was late (which is likely) we should use 1000/30 ms instead
       * of the real time elapsed. Math.floor(1000/30) happens to be 33ms.
       */
      const diff = Math.min(33, time - this.lastFrameTime);
      this.moveTo(this.nextPos[0], diff);
    }
    if (this.worldPos) {
      this.moveRecords.addRecord(time, this.worldPos.x, this.worldPos.y);
      this.checkGroundDamage(time);
    }
    if (this.players.size > 0) {
      for (const player of this.players.values()) {
        player.frameTick(this.lastTickId, time);
      }
    }
    if (this.enemies.size > 0) {
      for (const enemy of this.enemies.values()) {
        enemy.frameTick(this.lastTickId, time);
      }
    }
    if (this.projectiles.length > 0) {
      this.checkProjectiles(time);
    }
    this.lastFrameTime = time;
  }

  private onConnect(): void {
    Logger.log(this.alias, `Connected to ${this.internalServer.name}!`, LogLevel.Success);
    this.socketConnected = true;
    this.runtime.emit(Events.ClientConnect, this);
    this.lastTickTime = 0;
    this.lastAttackTime = 0;
    this.currentTickTime = 0;
    this.lastTickId = -1;
    this.currentBulletId = 1;
    this.hasPet = false;
    this.enemies.clear();
    this.players.clear();
    this.projectiles = [];
    this.moveRecords = new MoveRecords();
    this.sendHello();
  }

  private sendHello(): void {
    const hp: HelloPacket = new HelloPacket();
    hp.buildVersion = this.buildVersion;
    hp.gameId = this.internalGameId;
    hp.guid = rsa.encrypt(this.guid);
    hp.random1 = Math.floor(Math.random() * 1000000000);
    hp.password = rsa.encrypt(this.password);
    hp.random2 = Math.floor(Math.random() * 1000000000);
    hp.keyTime = this.keyTime;
    hp.key = this.key;
    hp.gameNet = 'rotmg';
    hp.playPlatform = 'rotmg';
    hp.trailer = this.runtime.clientToken;
    this.send(hp);
  }

  private getBulletId(): number {
    const bId = this.currentBulletId;
    this.currentBulletId = (this.currentBulletId + 1) % 128;
    return bId;
  }

  private onClose(): void {
    Logger.log(this.alias, `The connection to ${this.nexusServer.name} was closed.`, LogLevel.Warning);
    this.socketConnected = false;
    this.runtime.emit(Events.ClientDisconnect, this);
    this.nextPos.length = 0;
    this.pathfinderTarget = undefined;
    this.io.detach();
    this.clientSocket = undefined;
    if (this.pathfinder) {
      this.pathfinder.destroy();
    }

    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
      this.frameUpdateTimer = undefined;
    }
    if (this.reconnectCooldown <= 0) {
      this.reconnectCooldown = getWaitTime(this.proxy ? this.proxy.host : '');
    }
    this.connect();
  }

  private onError(error: Error): void {
    Logger.log(this.alias, `Received socket error: ${error.message}`, LogLevel.Error);
    Logger.log(this.alias, error.stack, LogLevel.Debug);
  }

  /**
   * Fixes the character cache after a dead character has been loaded.
   */
  private fixCharInfoCache(): void {
    Logger.log(this.alias, `Tried to load a dead character. Fixing character info cache...`, LogLevel.Warning);

    // update the char info
    this.charInfo.charId = this.charInfo.nextCharId;
    this.charInfo.nextCharId++;
    this.needsNewCharacter = true;

    // update the cache
    this.runtime.accountService.updateCharInfoCache(this.guid, this.charInfo);
  }

  private async connect(): Promise<void> {
    if (this.clientSocket) {
      this.clientSocket.destroy();
      return;
    }
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
      this.frameUpdateTimer = undefined;
    }

    if (this.reconnectCooldown > 0) {
      Logger.log(this.alias, `Connecting in ${(this.reconnectCooldown / 1000).toFixed(1)} seconds.`, LogLevel.Info);
      await delay(this.reconnectCooldown);
      this.reconnectCooldown = 0;
    }
    try {
      if (this.proxy) {
        Logger.log(this.alias, 'Establishing proxy', LogLevel.Info);
      }
      const socket = await createConnection(this.internalServer.address, 2050, this.proxy);
      this.clientSocket = socket;

      // attach the packetio
      this.io.attach(this.clientSocket);

      // add the event listeners.
      this.clientSocket.on('close', this.onClose.bind(this));
      this.clientSocket.on('error', this.onError.bind(this));

      // perform the connection logic.
      this.onConnect();
    } catch (err) {
      Logger.log(this.alias, `Error while connecting: ${err.message}`, LogLevel.Error);
      Logger.log(this.alias, err.stack, LogLevel.Debug);
      this.reconnectCooldown = getWaitTime(this.proxy ? this.proxy.host : '');
      this.connect();
    }
  }

  private moveTo(target: WorldPosData, timeElapsed: number): void {
    if (!target) {
      return;
    }
    const step = this.getSpeed(timeElapsed);
    if (this.worldPos.squareDistanceTo(target) > step ** 2) {
      const angle: number = Math.atan2(target.y - this.worldPos.y, target.x - this.worldPos.x);
      this.walkTo(this.worldPos.x + Math.cos(angle) * step, this.worldPos.y + Math.sin(angle) * step);
    } else {
      this.walkTo(target.x, target.y);
      const lastPos = this.nextPos.shift();
      if (this.nextPos.length === 0) {
        this.runtime.emit(Events.ClientArrived, this, lastPos);

        if (this.pathfinderTarget) {
          this.pathfinderTarget = undefined;
        }
      }
    }
  }

  private walkTo(x: number, y: number): void {
    // tslint:disable-next-line: no-bitwise
    if (hasEffect(this.playerData.condition, ConditionEffect.PARALYZED | ConditionEffect.PAUSED)) {
      return;
    }
    const xTile = this.mapTiles[Math.floor(this.worldPos.y) * this.mapInfo.width + Math.floor(x)];
    if (xTile && !xTile.occupied) {
      this.worldPos.x = x;
    }
    const yTile = this.mapTiles[Math.floor(y) * this.mapInfo.width + Math.floor(this.worldPos.x)];
    if (yTile && !yTile.occupied) {
      this.worldPos.y = y;
    }
  }

  private getAttackMultiplier(): number {
    if (hasEffect(this.playerData.condition, ConditionEffect.WEAK)) {
      return MIN_ATTACK_MULT;
    }
    let attackMultiplier = MIN_ATTACK_MULT + this.playerData.atk / 75 * (MAX_ATTACK_MULT - MIN_ATTACK_MULT);
    if (hasEffect(this.playerData.condition, ConditionEffect.DAMAGING)) {
      attackMultiplier *= 1.5;
    }
    return attackMultiplier;
  }

  private getSpeed(timeElapsed: number): number {
    if (hasEffect(this.playerData.condition, ConditionEffect.SLOWED)) {
      return MIN_MOVE_SPEED * this.tileMultiplier;
    }

    let speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);

    // tslint:disable-next-line: no-bitwise
    if (hasEffect(this.playerData.condition, ConditionEffect.SPEEDY | ConditionEffect.NINJA_SPEEDY)) {
      speed *= 1.5;
    }

    return (speed * this.tileMultiplier * timeElapsed * this.internalMoveMultiplier);
  }

  private getAttackFrequency(): number {
    if (hasEffect(this.playerData.condition, ConditionEffect.DAZED)) {
      return MIN_ATTACK_FREQ;
    }
    let atkFreq = MIN_ATTACK_FREQ + this.playerData.dex / 75 * (MAX_ATTACK_FREQ - MIN_ATTACK_FREQ);
    if (hasEffect(this.playerData.condition, ConditionEffect.BERSERK)) {
      atkFreq *= 1.5;
    }
    return atkFreq;
  }

  /**
   * Sends a packet only if the client is currently connected.
   * @param packet The packet to send.
   */
  private send(packet: Packet): void {
    if (!this.clientSocket.destroyed && this.io) {
      this.io.send(packet);
    } else {
      Logger.log(this.alias, `Not connected. Cannot send ${packet.type}.`, LogLevel.Debug);
    }
  }

  private calcHealth(delta: number): void {
    const interval = delta * 0.001;
    const bleeding = hasEffect(this.playerData.condition, ConditionEffect.BLEEDING);
    if (!hasEffect(this.playerData.condition, ConditionEffect.SICK) && !bleeding) {
      const vitPerSecond = 1 + 0.12 * this.playerData.vit;
      this.hpLog += vitPerSecond * interval;
      if (hasEffect(this.playerData.condition, ConditionEffect.HEALING)) {
        this.hpLog += 20 * interval;
      }
    } else if (bleeding) {
      this.hpLog -= 20 * interval;
    }

    const hpToAdd = Math.trunc(this.hpLog);
    const leftovers = this.hpLog - hpToAdd;
    this.hpLog = leftovers;
    this.clientHP += hpToAdd;
    if (this.clientHP > this.playerData.maxHP) {
      this.clientHP = this.playerData.maxHP;
    }
  }

  private checkHealth(time: number = -1): boolean {
    if (time === -1) {
      time = this.getTime();
    }

    if (!this.safeMap) {
      if (this.internalAutoNexusThreshold === 0) {
        return false;
      }
      const threshold = this.playerData.maxHP * this.internalAutoNexusThreshold;
      const minHp = Math.min(this.clientHP, this.playerData.hp);
      if (minHp < threshold) {
        const autoNexusPercent = minHp / this.playerData.maxHP * 100;
        Logger.log(this.alias, `Auto nexused at ${autoNexusPercent.toFixed(1)}%`, LogLevel.Warning);
        this.connectToNexus();
        return true;
      }
    }
    return false;
  }

  private addHealth(amount: number): void {
    this.clientHP += amount;
    if (this.clientHP >= this.playerData.maxHP) {
      this.clientHP = this.playerData.maxHP;
    }
  }
}
