/**
 * @module core
 */
import { AoeAckPacket, AoePacket, CreatePacket, CreateSuccessPacket, DamagePacket, EnemyHitPacket, EnemyShootPacket, FailureCode, FailurePacket, GotoAckPacket, GotoPacket, HelloPacket, LoadPacket, MapInfoPacket, MovePacket, NewTickPacket, Packet, PacketIO, PingPacket, PlayerHitPacket, PlayerShootPacket, Point, PongPacket, ReconnectPacket, ServerPlayerShootPacket, ShootAckPacket, UpdateAckPacket, UpdatePacket, WorldPosData } from '@realmlib/net';
import { Socket } from 'net';
import * as rsa from '../crypto/rsa';
import { Events } from '../models/events';
import { GameId } from '../models/game-ids';
import { MapTile } from '../models/map-tile';
import { Runtime } from '../runtime/runtime';
import { Logger, LogLevel, Random } from '../services';
import { NodeUpdate, Pathfinder } from '../services/pathfinding';
import { createConnection } from '../util/net-util';
import * as parsers from '../util/parsers';
import { PacketHook } from './../decorators';
import { Account, CharacterInfo, Classes, ConditionEffect, ConditionEffects, Enemy, getDefaultPlayerData, MapInfo, MoveRecords, PlayerData, Projectile, Proxy, Server } from './../models';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;
const MIN_ATTACK_FREQ = 0.0015;
const MAX_ATTACK_FREQ = 0.008;
const MIN_ATTACK_MULT = 0.5;
const MAX_ATTACK_MULT = 2;

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
   * Indicates whether or not the client's TCP socket is connected.
   */
  get connected(): boolean {
    return this.socketConnected;
  }
  private socketConnected: boolean;
  private internalMoveMultiplier: number;

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
  private reconnectTimer: NodeJS.Timer;

  // reconnect info
  private key: number[];
  private keyTime: number;
  private gameId: GameId;
  private reconnectCooldown: number;

  // enemies/projeciles
  private projectiles: Projectile[];
  private random: Random;
  private enemies: Map<number, Enemy>;

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
    this.autoAim = true;
    this.key = [];
    this.keyTime = -1;
    this.gameId = GameId.Nexus;
    this.playerData = getDefaultPlayerData();
    this.playerData.server = server.name;
    this.nextPos = [];
    this.internalMoveMultiplier = 1;
    this.currentBulletId = 1;
    this.lastAttackTime = 0;
    this.connectTime = Date.now();
    this.socketConnected = false;
    this.guid = accInfo.guid;
    this.password = accInfo.password;
    this.buildVersion = this.runtime.buildVersion;
    this.alias = accInfo.alias;
    this.proxy = accInfo.proxy;
    this.pathfinderEnabled = accInfo.pathfinder || false;
    if (accInfo.charInfo) {
      this.charInfo = accInfo.charInfo;
    } else {
      this.charInfo = { charId: 0, nextCharId: 1, maxNumChars: 1 };
    }
    this.internalServer = Object.assign({}, server);
    this.nexusServer = Object.assign({}, server);

    this.io = new PacketIO({ packetMap: this.runtime.packetMap });
    this.io.on('packet', (data: Packet) => {
      this.runtime.libraryManager.callHooks(data, this);
    });
    this.io.on('error', (err: Error) => {
      Logger.log(this.alias, `Received PacketIO error: ${err.message}`, LogLevel.Error);
      this.clientSocket.destroy();
    });

    Logger.log(this.alias, `Starting connection to ${server.name}`, LogLevel.Info);
    this.connect();
  }

  /**
   * Shoots a projectile at the specified angle.
   * @param angle The angle in radians to shoot towards.
   */
  shoot(angle: number): boolean {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.STUNNED)) {
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
    const arcRads = item.arcGap / 180 * Math.PI;
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
      this.io.send(shootPacket);
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
      this.projectiles.push(newProj);
      if (arcRads > 0) {
        angle += arcRads;
      }

      const projectile = item.projectile;
      let damage = this.random.nextIntInRange(projectile.minDamage, projectile.maxDamage);
      if (time > this.moveRecords.lastClearTime + 600) {
        damage = 0;
      }
      this.projectiles[this.projectiles.length - 1].setDamage(damage * this.getAttackMultiplier());
    }

    this.checkProjectiles();
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
      this.io = null;
    }

    // timers.
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
    }

    // resources.
    this.mapTiles = null;
    this.projectiles = null;
    this.enemies = null;

    if (this.socketConnected) {
      this.socketConnected = false;
      this.runtime.emit(Events.ClientDisconnect, this);
    }

    // client socket.
    if (this.clientSocket) {
      this.clientSocket.removeAllListeners('connect');
      this.clientSocket.removeAllListeners('close');
      this.clientSocket.removeAllListeners('error');
      this.clientSocket.destroy();
    }
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
  connectToServer(server: Server, gameId = this.gameId): void {
    Logger.log(this.alias, `Switching to ${server.name}.`, LogLevel.Info);
    this.internalServer = Object.assign({}, server);
    this.nexusServer = Object.assign({}, server);
    this.gameId = gameId;
    this.connect();
  }

  /**
   * Connects to the Nexus.
   */
  connectToNexus(): void {
    Logger.log(this.alias, 'Connecting to the Nexus.', LogLevel.Info);
    this.gameId = GameId.Nexus;
    this.internalServer = Object.assign({}, this.nexusServer);
    this.connect();
  }

  /**
   * Connects to `gameId` on the current server
   *  @param gameId The gameId to use upon connecting.
   */
  changeGameId(gameId: GameId): void {
    Logger.log(this.alias, `Changing gameId to ${gameId}`, LogLevel.Info);
    this.gameId = gameId;
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
        this.pathfinderTarget = null;
        this.nextPos.length = 0;
        return;
      }
      this.pathfinderTarget = to;
      this.nextPos.length = 0;
      this.nextPos.push(...path.map((p) => new WorldPosData(p.x + 0.5, p.y + 0.5)));
    }).catch((error: Error) => {
      Logger.log(this.alias, `Error finding path: ${error.message}`, LogLevel.Error);
    });
  }

  private damage(damage: number, bulletId: number, objectId: number): void {
    const min = damage * 3 / 20;
    const actualDamge = Math.max(min, damage - this.playerData.def);
    this.playerData.hp -= actualDamge;
    Logger.log(this.alias, `Took ${actualDamge} damage. At ${Math.round(this.playerData.hp)} health.`);
    if (this.playerData.hp <= this.playerData.maxHP * 0.3) {
      Logger.log(this.alias, `Auto nexused at ${Math.round(this.playerData.hp)} HP`, LogLevel.Warning);
      this.clientSocket.destroy();
      return;
    }
    const playerHit = new PlayerHitPacket();
    playerHit.bulletId = bulletId;
    playerHit.objectId = objectId;
    this.io.send(playerHit);
  }

  private checkProjectiles(): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      if (!this.projectiles[i].update(this.getTime())) {
        this.projectiles.splice(i, 1);
        continue;
      }
      if (this.projectiles[i].damagePlayers) {
        if (this.worldPos.squareDistanceTo(this.projectiles[i].currentPosition) < 0.25) {
          // hit.
          this.damage(this.projectiles[i].damage, this.projectiles[i].bulletId, this.projectiles[i].ownerObjectId);
          this.projectiles.splice(i, 1);
        }
      } else {
        let closestEnemy: Enemy;
        let closestDistance = 10000000;
        for (const enemy of this.enemies.values()) {
          const dist = enemy.squareDistanceTo(this.projectiles[i].currentPosition);
          if (dist < 0.25) {
            if (dist < closestDistance) {
              closestDistance = dist;
              closestEnemy = enemy;
            }
          }
        }
        if (closestEnemy) {
          const lastUpdate = (this.getTime() - closestEnemy.lastUpdate);
          if (lastUpdate > 400) {
            Logger.log(this.alias, `Preventing EnemyHit. Time since last update: ${lastUpdate}`, LogLevel.Debug);
            this.projectiles.splice(i, 1);
            continue;
          }
          const enemyHit = new EnemyHitPacket();
          const damage = closestEnemy.damage(this.projectiles[i].damage);
          enemyHit.bulletId = this.projectiles[i].bulletId;
          enemyHit.targetId = closestEnemy.objectData.objectId;
          enemyHit.time = this.getTime();
          enemyHit.kill = closestEnemy.objectData.hp <= damage;
          this.io.send(enemyHit);
          this.projectiles.splice(i, 1);
          if (enemyHit.kill) {
            closestEnemy.dead = true;
          }
        }
      }
    }
  }

  @PacketHook()
  private onDamage(client: Client, damage: DamagePacket): void {
    // if the bullet hit an enemy, do damage to that enemy
    if (this.enemies.has(damage.targetId)) {
      const enemy = this.enemies.get(damage.targetId);
      enemy.objectData.hp -= damage.damageAmount;
      // remove the enemy if it's dead.
      if (enemy.objectData.hp < 0 || damage.kill) {
        this.enemies.delete(damage.targetId);
      }
      return;
    }
    // if an enemy was the target of the damage, remove the projectile.
    // TODO: handle multi-hit projectiles.
    if (this.enemies.has(damage.objectId)) {
      this.projectiles = this.projectiles.filter((p) => p.ownerObjectId !== damage.objectId);
    }
  }

  @PacketHook()
  private onMapInfo(client: Client, mapInfoPacket: MapInfoPacket): void {
    if (this.charInfo.charId > 0) {
      const loadPacket = new LoadPacket();
      loadPacket.charId = this.charInfo.charId;
      loadPacket.isFromArena = false;
      Logger.log(this.alias, `Connecting to ${mapInfoPacket.name}`, LogLevel.Info);
      this.io.send(loadPacket);
    } else {
      const createPacket = new CreatePacket();
      createPacket.classType = Classes.Wizard;
      createPacket.skinType = 0;
      Logger.log(this.alias, 'Creating new char', LogLevel.Info);
      this.io.send(createPacket);
    }
    this.random = new Random(mapInfoPacket.fp);
    this.mapTiles = [];
    this.mapInfo = { width: mapInfoPacket.width, height: mapInfoPacket.height, name: mapInfoPacket.name };
    if (this.pathfinderEnabled) {
      this.pathfinder = new Pathfinder(mapInfoPacket.width);
    }
  }

  @PacketHook()
  private onUpdate(client: Client, updatePacket: UpdatePacket): void {
    // reply
    const updateAck = new UpdateAckPacket();
    this.io.send(updateAck);

    const pathfinderUpdates: NodeUpdate[] = [];
    // playerdata
    for (const obj of updatePacket.newObjects) {
      if (obj.status.objectId === this.objectId) {
        this.worldPos = obj.status.pos;
        this.playerData = parsers.processObject(obj);
        this.playerData.server = this.internalServer.name;
      }
      if (this.runtime.resources.objects[obj.objectType]) {
        const gameObject = this.runtime.resources.objects[obj.objectType];
        if (gameObject.fullOccupy || gameObject.occupySquare) {
          const index = Math.floor(obj.status.pos.y) * this.mapInfo.width + Math.floor(obj.status.pos.x);
          if (!this.mapTiles[index]) {
            this.mapTiles[index] = { occupied: true } as MapTile;
          } else {
            this.mapTiles[index].occupied = true;
          }
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
        if (gameObject.enemy) {
          if (!this.enemies.has(obj.status.objectId)) {
            this.enemies.set(obj.status.objectId, new Enemy(gameObject, obj.status));
          }
        }
      }
    }

    // map tiles
    for (const tile of updatePacket.tiles) {
      const index = tile.y * this.mapInfo.width + tile.x;
      let occupied = false;
      if (this.mapTiles[index]) {
        occupied = this.mapTiles[index].occupied;
      }
      this.mapTiles[index] = tile as MapTile;
      this.mapTiles[index].occupied = occupied;
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
    }

    if (pathfinderUpdates.length > 0 && this.pathfinderEnabled) {
      this.pathfinder.updateWalkableNodes(pathfinderUpdates);
      if (this.pathfinderTarget) {
        this.findPath(this.pathfinderTarget);
      }
    }
  }

  @PacketHook()
  private onReconnectPacket(client: Client, reconnectPacket: ReconnectPacket): void {
    // if there is a new host, then switch to it.
    if (reconnectPacket.host !== '') {
      this.internalServer.address = reconnectPacket.host;
    }
    // same story with the name.
    if (reconnectPacket.name !== '') {
      this.internalServer.name = reconnectPacket.name;
    }
    this.gameId = reconnectPacket.gameId;
    this.key = reconnectPacket.key;
    this.keyTime = reconnectPacket.keyTime;
    this.connect();
  }

  @PacketHook()
  private onGotoPacket(client: Client, gotoPacket: GotoPacket): void {
    const ack = new GotoAckPacket();
    ack.time = this.getTime();
    this.io.send(ack);
    if (gotoPacket.objectId === this.objectId) {
      this.worldPos = gotoPacket.position.clone();
    }
    if (this.enemies.has(gotoPacket.objectId)) {
      this.enemies.get(gotoPacket.objectId).onGoto(gotoPacket.position.x, gotoPacket.position.y, this.lastFrameTime);
    }
  }

  @PacketHook()
  private onFailurePacket(client: Client, failurePacket: FailurePacket): void {
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
        this.gameId = -2;
        this.keyTime = -1;
        break;
      default:
        Logger.log(this.alias, `Received failure ${failurePacket.errorId}: "${failurePacket.errorDescription}"`, LogLevel.Error);
        break;
    }
  }

  @PacketHook()
  private onAoe(client: Client, aoePacket: AoePacket): void {
    const aoeAck = new AoeAckPacket();
    aoeAck.time = this.getTime();
    aoeAck.position = this.worldPos.clone();
    if (aoePacket.pos.squareDistanceTo(this.worldPos) < aoePacket.radius ** 2) {
      this.playerData.hp -= aoePacket.damage;
    }
    this.io.send(aoeAck);
  }

  @PacketHook()
  private onNewTick(client: Client, newTickPacket: NewTickPacket): void {
    this.lastTickTime = this.currentTickTime;
    this.lastTickId = newTickPacket.tickId;
    this.currentTickTime = this.getTime();
    // reply
    const movePacket = new MovePacket();
    movePacket.tickId = newTickPacket.tickId;
    movePacket.time = this.getTime();
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
    this.io.send(movePacket);

    // hp.
    const elapsedMS = this.currentTickTime - this.lastTickTime;
    this.playerData.hp += elapsedMS / 1000 * (1 + 0.12 * this.playerData.vit);
    if (this.playerData.hp > this.playerData.maxHP) {
      this.playerData.hp = this.playerData.maxHP;
    }

    for (const status of newTickPacket.statuses) {
      if (status.objectId === this.objectId) {
        const beforeHP = this.playerData.hp;
        this.playerData = parsers.processStatData(status.stats, this.playerData);
        // synchronise the client hp if the difference is more than 30% of the HP.
        if (Math.abs(beforeHP - this.playerData.hp) < this.playerData.maxHP * 0.3) {
          this.playerData.hp = beforeHP;
        }
        this.playerData.objectId = this.objectId;
        this.playerData.worldPos = this.worldPos;
        this.playerData.server = this.internalServer.name;
        continue;
      }
      if (this.enemies.has(status.objectId)) {
        this.enemies.get(status.objectId).onNewTick(status, elapsedMS, newTickPacket.tickId, this.lastFrameTime);
      }
    }

    if (this.autoAim && this.playerData.inventory[0] !== -1 && this.enemies.size > 0) {
      const projectile = this.runtime.resources.items[this.playerData.inventory[0]].projectile;
      const distance = projectile.lifetimeMS * (projectile.speed / 10000);
      for (const enemy of this.enemies.values()) {
        if (enemy.squareDistanceTo(this.worldPos) < distance ** 2) {
          const angle = Math.atan2(enemy.objectData.worldPos.y - this.worldPos.y, enemy.objectData.worldPos.x - this.worldPos.x);
          this.shoot(angle);
        }
      }
    }
  }

  @PacketHook()
  private onPing(client: Client, pingPacket: PingPacket): void {
    // reply
    const pongPacket = new PongPacket();
    pongPacket.serial = pingPacket.serial;
    pongPacket.time = this.getTime();
    this.io.send(pongPacket);
  }

  @PacketHook()
  private onEnemyShoot(client: Client, enemyShootPacket: EnemyShootPacket): void {
    const shootAck = new ShootAckPacket();
    shootAck.time = this.getTime();
    const owner = this.enemies.get(enemyShootPacket.ownerId);
    if (!owner || owner.dead) {
      shootAck.time = -1;
    }
    this.io.send(shootAck);
    if (!owner || owner.dead) {
      return;
    }
    for (let i = 0; i < enemyShootPacket.numShots; i++) {
      this.projectiles.push(
        new Projectile(
          owner.properties.type,
          this.runtime.resources.objects[owner.properties.type],
          enemyShootPacket.bulletType,
          enemyShootPacket.ownerId,
          (enemyShootPacket.bulletId + i) % 256,
          enemyShootPacket.angle + i * enemyShootPacket.angleInc,
          this.getTime(),
          enemyShootPacket.startingPos,
        ),
      );
      this.projectiles[this.projectiles.length - 1].setDamage(enemyShootPacket.damage);
    }
  }

  @PacketHook()
  private onServerPlayerShoot(client: Client, serverPlayerShoot: ServerPlayerShootPacket): void {
    if (serverPlayerShoot.ownerId === this.objectId) {
      const ack = new ShootAckPacket();
      ack.time = this.getTime();
      this.io.send(ack);
    }
  }

  @PacketHook()
  private onCreateSuccess(client: Client, createSuccessPacket: CreateSuccessPacket): void {
    Logger.log(this.alias, 'Connected!', LogLevel.Success);
    this.objectId = createSuccessPacket.objectId;
    this.charInfo.charId = createSuccessPacket.charId;
    this.charInfo.nextCharId = this.charInfo.charId + 1;
    this.lastFrameTime = this.getTime();
    this.runtime.emit(Events.ClientReady, this);
    this.frameUpdateTimer = setInterval(() => {
      const time = this.getTime();
      if (this.nextPos.length > 0) {
        /**
         * We don't want to move further than we are allowed to, so if the
         * timer was late (which is likely) we should use 1000/30 ms instead
         * of the real time elapsed.
         */
        const diff = Math.min(1000 / 30, time - this.lastFrameTime);
        this.moveTo(this.nextPos[0], diff);
      }
      if (this.worldPos) {
        this.moveRecords.addRecord(time, this.worldPos.x, this.worldPos.y);
      }
      if (this.enemies.size > 0) {
        for (const enemy of this.enemies.values()) {
          enemy.frameTick(this.lastTickId, time);
        }
      }
      if (this.projectiles.length > 0) {
        this.checkProjectiles();
      }
      this.lastFrameTime = time;
    }, 1000 / 30);
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
    this.enemies = new Map();
    this.projectiles = [];
    this.moveRecords = new MoveRecords();
    this.sendHello();
  }

  private sendHello(): void {
    const hp: HelloPacket = new HelloPacket();
    hp.buildVersion = this.buildVersion;
    hp.gameId = this.gameId;
    hp.guid = rsa.encrypt(this.guid);
    hp.random1 = Math.floor(Math.random() * 1000000000);
    hp.password = rsa.encrypt(this.password);
    hp.random2 = Math.floor(Math.random() * 1000000000);
    hp.keyTime = this.keyTime;
    hp.key = this.key;
    hp.gameNet = 'rotmg';
    hp.playPlatform = 'rotmg';
    this.io.send(hp);
  }

  private getBulletId(): number {
    const bId = this.currentBulletId;
    this.currentBulletId = (this.currentBulletId + 1) % 128;
    return bId;
  }

  private onClose(error: boolean): void {
    Logger.log(this.alias, `The connection to ${this.internalServer.name} was closed.`, LogLevel.Warning);
    this.socketConnected = false;
    this.runtime.emit(Events.ClientDisconnect, this);
    this.nextPos.length = 0;
    this.pathfinderTarget = null;
    this.internalServer = Object.assign({}, this.nexusServer);
    if (this.pathfinder) {
      this.pathfinder.destroy();
    }
    this.projectiles = [];
    this.enemies = new Map();
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
      this.frameUpdateTimer = null;
    }
    let reconnectTime = 5;
    if (this.reconnectCooldown) {
      reconnectTime = this.reconnectCooldown;
      this.reconnectCooldown = null;
    }
    Logger.log(this.alias, `Reconnecting in ${reconnectTime} seconds`);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, reconnectTime * 1000);
  }

  private onError(error: Error): void {
    Logger.log(this.alias, `Received socket error: ${error.message}`, LogLevel.Error);
  }

  private connect(): void {
    if (this.clientSocket) {
      this.io.detach();
      this.clientSocket.removeAllListeners('close');
      this.clientSocket.removeAllListeners('error');
      this.clientSocket.destroy();
    }
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
      this.frameUpdateTimer = null;
    }
    if (this.projectiles.length > 0) {
      this.projectiles = [];
    }

    if (this.proxy) {
      Logger.log(this.alias, 'Establishing proxy', LogLevel.Info);
    }
    createConnection(this.internalServer.address, 2050, this.proxy).then((socket) => {
      this.clientSocket = socket;

      // attach the packetio
      this.io.attach(this.clientSocket);

      // add the event listeners.
      this.clientSocket.on('close', this.onClose.bind(this));
      this.clientSocket.on('error', this.onError.bind(this));

      // perform the connection logic.
      this.onConnect();
    }).catch((err) => {
      Logger.log(this.alias, `Error while connecting: ${err.message}`, LogLevel.Error);
    });
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
      this.nextPos.shift();
      if (this.nextPos.length === 0 && this.pathfinderTarget) {
        this.pathfinderTarget = null;
      }
    }
  }

  private walkTo(x: number, y: number): void {
    if (!this.mapTiles[Math.floor(this.worldPos.y) * this.mapInfo.width + Math.floor(x)].occupied) {
      this.worldPos.x = x;
    }
    if (!this.mapTiles[Math.floor(y) * this.mapInfo.width + Math.floor(this.worldPos.x)].occupied) {
      this.worldPos.y = y;
    }
  }

  private getAttackMultiplier(): number {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.WEAK)) {
      return MIN_ATTACK_MULT;
    }
    let attackMultiplier = MIN_ATTACK_MULT + this.playerData.atk / 75 * (MAX_ATTACK_MULT - MIN_ATTACK_MULT);
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.DAMAGING)) {
      attackMultiplier *= 1.5;
    }
    return attackMultiplier;
  }

  private getSpeed(timeElapsed: number): number {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.SLOWED)) {
      return MIN_MOVE_SPEED;
    }
    let speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);
    const x = Math.floor(this.worldPos.x);
    const y = Math.floor(this.worldPos.y);
    let multiplier = 1;

    if (this.mapTiles[y * this.mapInfo.width + x] && this.runtime.resources.tiles[this.mapTiles[y * this.mapInfo.width + x].type]) {
      multiplier = this.runtime.resources.tiles[this.mapTiles[y * this.mapInfo.width + x].type].speed;
    }

    // tslint:disable no-bitwise
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.SPEEDY | ConditionEffect.NINJA_SPEEDY)) {
      speed *= 1.5;
    }
    // tslint:enable no-bitwise

    return (speed * multiplier * timeElapsed * this.internalMoveMultiplier);
  }

  private getAttackFrequency(): number {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.DAZED)) {
      return MIN_ATTACK_FREQ;
    }
    let atkFreq = MIN_ATTACK_FREQ + this.playerData.dex / 75 * (MAX_ATTACK_FREQ - MIN_ATTACK_FREQ);
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.BERSERK)) {
      atkFreq *= 1.5;
    }
    return atkFreq;
  }
}
