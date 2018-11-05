/**
 * @module core
 */
import { Socket } from 'net';
import { Logger, LogLevel, Random, Storage } from '../services';
import { PacketType, PacketIO, IncomingPacket } from './../networking';
import {
  HelloPacket,
  LoadPacket,
  PongPacket,
  MovePacket,
  CreatePacket,
  GotoAckPacket,
  AoeAckPacket,
  ShootAckPacket,
  UpdateAckPacket,
  PlayerShootPacket,
  PlayerHitPacket,
  EnemyHitPacket
} from './../networking/packets/outgoing';
import {
  UpdatePacket,
  PingPacket,
  NewTickPacket,
  FailurePacket,
  CreateSuccessPacket,
  MapInfoPacket,
  GotoPacket,
  ReconnectPacket,
  AoePacket,
  EnemyShootPacket,
  ServerPlayerShootPacket,
  DamagePacket
} from './../networking/packets/incoming';
import {
  Account, CharacterInfo,
  PlayerData, getDefaultPlayerData,
  Classes,
  MapInfo,
  environment,
  Projectile,
  Enemy,
  MoveRecords,
  ConditionEffects, ConditionEffect,
  Proxy,
  Server
} from './../models';
import {
  WorldPosData,
  GroundTileData,
  ObjectStatusData,
} from './../networking/data';
import { LibraryManager, ResourceManager } from './../core';
import { PacketHook } from './../decorators';
import { EventEmitter } from 'events';
import { SocksClient } from 'socks';
import { CLI } from '..';
import { Pathfinder, NodeUpdate, Point } from '../services/pathfinding';
import { FailureCode } from '../models/failure-code';
import { GameId } from '../models/game-ids';
import { MapTile } from '../models/map-tile';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;
const MIN_ATTACK_FREQ = 0.0015;
const MAX_ATTACK_FREQ = 0.008;
const MIN_ATTACK_MULT = 0.5;
const MAX_ATTACK_MULT = 2;

declare type ClientEvent = 'connect' | 'disconnect' | 'ready';

export class Client {

  /**
   * Attaches an event listener to the client.
   * @example
   * ```
   * Client.on('disconnect', (client) => {
   *   delete this.clients[client.alias];
   * });
   * ```
   * @param event The name of the event to listen for.
   * @param listener The callback to invoke when the event is fired.
   */
  static on(event: ClientEvent, listener: (client: Client) => void): EventEmitter {
    if (!this.emitter) {
      this.emitter = new EventEmitter();
    }
    return this.emitter.on(event, listener);
  }
  private static emitter: EventEmitter;

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
  packetio: PacketIO;
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

  // packet control
  private blockedPackets: PacketType[];

  // enemies/projeciles
  private projectiles: Projectile[];
  private projectileUpdateTimer: NodeJS.Timer;
  private random: Random;
  private enemies: {
    [objectId: number]: Enemy;
  };

  /**
   * Creates a new instance of the client and begins the connection process to the specified server.
   * @param server The server to connect to.
   * @param buildVersion The current build version of RotMG.
   * @param accInfo The account info to connect with.
   */
  constructor(server: Server, buildVersion: string, accInfo: Account) {
    if (!Client.emitter) {
      Client.emitter = new EventEmitter();
    }
    this.blockedPackets = [];
    this.projectiles = [];
    this.projectileUpdateTimer = null;
    this.enemies = {};
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
    this.buildVersion = buildVersion;
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
    Logger.log(this.alias, `Starting connection to ${server.name}`, LogLevel.Info);
    this.connect();
  }

  /**
   * Shoots a projectile at the specified angle.
   * @param angle The angle in radians to shoot towards.
   */
  public shoot(angle: number): boolean {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.STUNNED)) {
      return;
    }
    const time = this.getTime();
    const item = ResourceManager.items[this.playerData.inventory[0]];
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
      this.packetio.sendPacket(shootPacket);
      this.projectiles.push(new Projectile(item.type, 0, this.objectId, shootPacket.bulletId, angle, time, {
        x: shootPacket.startingPos.x,
        y: shootPacket.startingPos.y
      }));
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
    if (this.packetio) {
      this.packetio.destroy();
    }

    // timers.
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.projectileUpdateTimer) {
      clearInterval(this.projectileUpdateTimer);
      this.projectileUpdateTimer = null;
    }
    if (this.frameUpdateTimer) {
      clearInterval(this.frameUpdateTimer);
      this.frameUpdateTimer = null;
    }

    // resources.
    this.mapTiles = null;
    this.projectiles = null;
    this.enemies = null;

    if (this.socketConnected) {
      this.socketConnected = false;
      Client.emitter.emit('disconnect', this);
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
   * `null` will remove the current proxy if there is one.
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
   */
  connectToServer(server: Server): void {
    Logger.log(this.alias, `Switching to ${server.name}.`, LogLevel.Info);
    this.internalServer = server;
    this.nexusServer = server;
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
   * Blocks the next packet of the specified type.
   * @param packetType The packet type to block.
   * @deprecated Prefer using a library to hook the desired packet
   * and set its `send` property to `false`.
   */
  blockNext(packetType: PacketType): void {
    if (this.blockedPackets.indexOf(packetType) < 0) {
      this.blockedPackets.push(packetType);
    }
  }

  /**
   * Broadcasts a packet to all connected clients except
   * the client which broadcasted the packet.
   * @param packet The packet to broadcast.
   */
  broadcastPacket(packet: IncomingPacket): void {
    const clients = CLI.getClients();
    for (const client of clients) {
      if (client.guid !== this.guid) {
        client.packetio.emitPacket(packet);
      }
    }
  }

  /**
   * Returns how long the client has been connected for, in milliseconds.
   */
  getTime(): number {
    return (Date.now() - this.connectTime);
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
    this.pathfinder.findPath(this.worldPos.toPoint(), to).then((path) => {
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
    this.packetio.sendPacket(playerHit);
  }

  private checkProjectiles(): void {
    if (this.projectiles.length > 0) {
      if (!this.projectileUpdateTimer) {
        this.projectileUpdateTimer = setInterval(() => {
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
              for (const enemyId in this.enemies) {
                if (this.enemies.hasOwnProperty(enemyId)) {
                  const enemy = this.enemies[+enemyId];
                  const dist = enemy.squareDistanceTo(this.projectiles[i].currentPosition);
                  if (dist < 0.25) {
                    if (dist < closestDistance) {
                      closestDistance = dist;
                      closestEnemy = enemy;
                    }
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
                this.packetio.sendPacket(enemyHit);
                this.projectiles.splice(i, 1);
                if (enemyHit.kill) {
                  closestEnemy.dead = true;
                }
              }
            }
          }
          if (this.projectiles.length === 0) {
            clearInterval(this.projectileUpdateTimer);
            this.projectileUpdateTimer = null;
          }
        }, 1000 / 30);
      }
    }
  }

  @PacketHook()
  private onDamage(client: Client, damage: DamagePacket): void {
    if (this.enemies[damage.targetId]) {
      this.enemies[damage.targetId].objectData.hp -= damage.damageAmount;
      if (this.enemies[damage.targetId].objectData.hp < 0 || damage.kill) {
        delete this.enemies[damage.targetId];
      }
      return;
    }
    if (this.enemies[damage.objectId]) {
      this.projectiles = this.projectiles.filter((p) => {
        return !(p.ownerObjectId === damage.objectId && p.bulletId === p.bulletId);
      });
    }
  }

  @PacketHook()
  private onMapInfo(client: Client, mapInfoPacket: MapInfoPacket): void {
    if (this.charInfo.charId > 0) {
      const loadPacket = new LoadPacket();
      loadPacket.charId = this.charInfo.charId;
      loadPacket.isFromArena = false;
      Logger.log(this.alias, `Connecting to ${mapInfoPacket.name}`, LogLevel.Info);
      this.packetio.sendPacket(loadPacket);
    } else {
      const createPacket = new CreatePacket();
      createPacket.classType = Classes.Wizard;
      createPacket.skinType = 0;
      Logger.log(this.alias, 'Creating new char', LogLevel.Info);
      this.packetio.sendPacket(createPacket);
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
    this.packetio.sendPacket(updateAck);

    const pathfinderUpdates: NodeUpdate[] = [];
    // playerdata
    for (const obj of updatePacket.newObjects) {
      if (obj.status.objectId === this.objectId) {
        this.worldPos = obj.status.pos;
        this.playerData = ObjectStatusData.processObject(obj);
        this.playerData.server = this.internalServer.name;
      }
      if (ResourceManager.objects[obj.objectType]) {
        const gameObject = ResourceManager.objects[obj.objectType];
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
              walkable: false
            });
          }
        }
        if (gameObject.enemy) {
          if (!this.enemies[obj.status.objectId]) {
            this.enemies[obj.status.objectId]
              = new Enemy(gameObject, obj.status);
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
        if (ResourceManager.tiles[tile.type].noWalk) {
          pathfinderUpdates.push({
            x: Math.floor(tile.x),
            y: Math.floor(tile.y),
            walkable: false
          });
        }
      }
    }

    // drops
    for (const drop of updatePacket.drops) {
      if (this.enemies[drop]) {
        delete this.enemies[drop];
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
    this.internalServer.address = (reconnectPacket.host === '' ? this.nexusServer.address : reconnectPacket.host);
    this.internalServer.name = (reconnectPacket.host === '' ? this.nexusServer.name : reconnectPacket.name);
    this.gameId = reconnectPacket.gameId;
    this.key = reconnectPacket.key;
    this.keyTime = reconnectPacket.keyTime;
    this.connect();
  }

  @PacketHook()
  private onGotoPacket(client: Client, gotoPacket: GotoPacket): void {
    const ack = new GotoAckPacket();
    ack.time = this.getTime();
    this.packetio.sendPacket(ack);
    if (gotoPacket.objectId === this.objectId) {
      this.worldPos = gotoPacket.position.clone();
    }
    if (this.enemies[gotoPacket.objectId]) {
      this.enemies[gotoPacket.objectId].onGoto(gotoPacket.position.x, gotoPacket.position.y, this.lastFrameTime);
    }
  }

  @PacketHook()
  private onFailurePacket(client: Client, failurePacket: FailurePacket): void {
    switch (failurePacket.errorId) {
      case FailureCode.IncorrectVersion:
        Logger.log(this.alias, 'buildVersion out of date. Updating and reconnecting...');
        this.buildVersion = failurePacket.errorDescription;
        Storage.updateBuildVersion(failurePacket.errorDescription);
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
    this.packetio.sendPacket(aoeAck);
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
    if (this.nextPos.length > 0) {
      this.moveTo(this.nextPos[0]);
    }
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
    this.packetio.sendPacket(movePacket);

    // hp.
    const elapsedMS = this.currentTickTime - this.lastTickTime;
    this.playerData.hp += elapsedMS / 1000 * (1 + 0.12 * this.playerData.vit);
    if (this.playerData.hp > this.playerData.maxHP) {
      this.playerData.hp = this.playerData.maxHP;
    }

    for (const status of newTickPacket.statuses) {
      if (status.objectId === this.objectId) {
        const beforeHP = this.playerData.hp;
        this.playerData = ObjectStatusData.processStatData(status.stats, this.playerData);
        // synchronise the client hp if the difference is more than 30% of the HP.
        if (Math.abs(beforeHP - this.playerData.hp) < this.playerData.maxHP * 0.3) {
          this.playerData.hp = beforeHP;
        }
        this.playerData.objectId = this.objectId;
        this.playerData.worldPos = this.worldPos;
        this.playerData.server = this.internalServer.name;
        continue;
      }
      if (this.enemies[status.objectId]) {
        this.enemies[status.objectId].onNewTick(status, elapsedMS, newTickPacket.tickId, this.lastFrameTime);
      }
    }

    if (this.autoAim && this.playerData.inventory[0] !== -1) {
      const keys = Object.keys(this.enemies);
      const projectile = ResourceManager.items[this.playerData.inventory[0]].projectile;
      const distance = projectile.lifetimeMS * (projectile.speed / 10000);
      for (const key of keys) {
        const enemy = this.enemies[+key];
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
    this.packetio.sendPacket(pongPacket);
  }

  @PacketHook()
  private onEnemyShoot(client: Client, enemyShootPacket: EnemyShootPacket): void {
    const shootAck = new ShootAckPacket();
    shootAck.time = this.getTime();
    const owner = this.enemies[enemyShootPacket.ownerId];
    if (!owner || owner.dead) {
      shootAck.time = -1;
    }
    this.packetio.sendPacket(shootAck);
    if (!owner || owner.dead) {
      return;
    }
    for (let i = 0; i < enemyShootPacket.numShots; i++) {
      this.projectiles.push(
        new Projectile(
          owner.properties.type,
          enemyShootPacket.bulletType,
          enemyShootPacket.ownerId,
          (enemyShootPacket.bulletId + i) % 256,
          enemyShootPacket.angle + i * enemyShootPacket.angleInc,
          this.getTime(),
          enemyShootPacket.startingPos.toPrecisePoint()
        )
      );
      this.projectiles[this.projectiles.length - 1].setDamage(enemyShootPacket.damage);
    }
    this.checkProjectiles();
  }

  @PacketHook()
  private onServerPlayerShoot(client: Client, serverPlayerShoot: ServerPlayerShootPacket): void {
    if (serverPlayerShoot.ownerId === this.objectId) {
      const ack = new ShootAckPacket();
      ack.time = this.getTime();
      this.packetio.sendPacket(ack);
    }
  }

  @PacketHook()
  private onCreateSuccess(client: Client, createSuccessPacket: CreateSuccessPacket): void {
    Logger.log(this.alias, 'Connected!', LogLevel.Success);
    this.objectId = createSuccessPacket.objectId;
    this.charInfo.charId = createSuccessPacket.charId;
    this.charInfo.nextCharId = this.charInfo.charId + 1;
    this.lastFrameTime = this.getTime();
    Client.emitter.emit('ready', this);
    this.frameUpdateTimer = setInterval(() => {
      const time = this.getTime();
      if (this.worldPos) {
        this.moveRecords.addRecord(time, this.worldPos.x, this.worldPos.y);
      }
      const enemies = Object.keys(this.enemies).map((k) => this.enemies[+k]);
      if (enemies.length > 0) {
        for (const enemy of enemies) {
          enemy.frameTick(this.lastTickId, time);
        }
      }
      this.lastFrameTime = time;
    }, 1000 / 30);
  }

  private onConnect(): void {
    Logger.log(this.alias, `Connected to ${this.internalServer.name}!`, LogLevel.Success);
    this.socketConnected = true;
    Client.emitter.emit('connect', this);
    this.lastTickTime = 0;
    this.lastAttackTime = 0;
    this.currentTickTime = 0;
    this.lastTickId = -1;
    this.currentBulletId = 1;
    this.enemies = {};
    this.projectiles = [];
    this.moveRecords = new MoveRecords();
    this.sendHello();
  }

  private sendHello(): void {
    const hp: HelloPacket = new HelloPacket();
    hp.buildVersion = this.buildVersion;
    hp.gameId = this.gameId;
    hp.guid = this.guid;
    hp.password = this.password;
    hp.keyTime = this.keyTime;
    hp.key = this.key;
    hp.gameNet = 'rotmg';
    hp.playPlatform = 'rotmg';
    this.packetio.sendPacket(hp);
  }

  private getBulletId(): number {
    const bId = this.currentBulletId;
    this.currentBulletId = (this.currentBulletId + 1) % 128;
    return bId;
  }

  private onClose(error: boolean): void {
    Logger.log(this.alias, `The connection to ${this.internalServer.name} was closed.`, LogLevel.Warning);
    this.socketConnected = false;
    Client.emitter.emit('disconnect', this);
    this.nextPos.length = 0;
    this.pathfinderTarget = null;
    this.internalServer = Object.assign({}, this.nexusServer);
    if (this.pathfinder) {
      this.pathfinder.destroy();
    }
    this.projectiles = [];
    this.enemies = {};
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
      this.clientSocket.removeAllListeners('connect');
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
    if (this.projectileUpdateTimer) {
      clearInterval(this.projectileUpdateTimer);
      this.projectileUpdateTimer = null;
    }

    if (this.proxy) {
      Logger.log(this.alias, 'Establishing proxy', LogLevel.Info);
      SocksClient.createConnection({
        proxy: {
          ipaddress: this.proxy.host,
          port: this.proxy.port,
          type: this.proxy.type,
          userId: this.proxy.userId,
          password: this.proxy.password
        },
        command: 'connect',
        destination: {
          host: this.internalServer.address,
          port: 2050
        }
      }).then((info) => {
        Logger.log(this.alias, 'Established proxy!', LogLevel.Success);
        this.clientSocket = info.socket;
        this.initSocket(false);
      }).catch((error) => {
        Logger.log(this.alias, 'Error establishing proxy', LogLevel.Error);
        Logger.log(this.alias, error, LogLevel.Error);
      });
    } else {
      this.clientSocket = new Socket({
        readable: true,
        writable: true
      });
      this.initSocket(true);
    }
  }

  private initSocket(connect: boolean): void {
    if (this.packetio) {
      this.packetio.destroy();
    }
    this.packetio = new PacketIO(this.clientSocket);
    this.packetio.on('packet', (data: IncomingPacket) => {
      const index = this.blockedPackets.indexOf(data.type);
      if (index > -1) {
        this.blockedPackets = this.blockedPackets.filter((p) => p !== data.type);
      } else {
        LibraryManager.callHooks(data, this);
      }
    });
    this.packetio.on('error', (err: Error) => {
      Logger.log(this.alias, `Received PacketIO error: ${err.message}`, LogLevel.Error);
      this.clientSocket.destroy();
    });
    if (connect) {
      this.clientSocket.connect(2050, this.internalServer.address);
    } else {
      this.onConnect();
    }
    this.clientSocket.on('connect', this.onConnect.bind(this));
    this.clientSocket.on('close', this.onClose.bind(this));
    this.clientSocket.on('error', this.onError.bind(this));
  }

  private moveTo(target: WorldPosData): void {
    if (!target) {
      return;
    }
    const step = this.getSpeed();
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

  private getSpeed(): number {
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.SLOWED)) {
      return MIN_MOVE_SPEED;
    }
    let speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);
    const x = Math.floor(this.worldPos.x);
    const y = Math.floor(this.worldPos.y);
    let multiplier = 1;

    if (this.mapTiles[y * this.mapInfo.width + x] && ResourceManager.tiles[this.mapTiles[y * this.mapInfo.width + x].type]) {
      multiplier = ResourceManager.tiles[this.mapTiles[y * this.mapInfo.width + x].type].speed;
    }
    let tickTime = this.currentTickTime - this.lastTickTime;

    if (tickTime > 200) {
      tickTime = 200;
    }
    // tslint:disable no-bitwise
    if (ConditionEffects.has(this.playerData.condition, ConditionEffect.SPEEDY | ConditionEffect.NINJA_SPEEDY)) {
      speed *= 1.5;
    }
    // tslint:enable no-bitwise

    return (speed * multiplier * tickTime * this.internalMoveMultiplier);
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
