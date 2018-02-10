import { Socket } from 'net';
import { Log, LogLevel } from '../services/logger';
import { Packet, PacketType } from './../networking/packet';
import { IAccountInfo, IAccount, ICharacterInfo } from './../models/accinfo';
import { IProxy } from './../models/proxy';
import { IServer } from './../models/server';
import { Packets } from './../networking/packets';
import { HelloPacket } from './../networking/packets/outgoing/hello-packet';
import { LoadPacket } from './../networking/packets/outgoing/load-packet';
import { UpdatePacket } from './../networking/packets/incoming/update-packet';
import { PingPacket } from './../networking/packets/incoming/ping-packet';
import { PongPacket } from './../networking/packets/outgoing/pong-packet';
import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';
import { FailurePacket } from './../networking/packets/incoming/failure-packet';
import { MovePacket } from './../networking/packets/outgoing/move-packet';
import { CreateSuccessPacket } from './../networking/packets/incoming/createsuccess-packet';
import { CreatePacket } from './../networking/packets/outgoing/create-packet';
import { WorldPosData } from './../networking/data/world-pos-data';
import { GroundTileData } from './../networking/data/ground-tile-data';
import { StatData } from './../networking/data/stat-data';
import { ObjectStatusData } from './../networking/data/object-status-data';
import { IPlayerData, getDefaultPlayerData } from './../models/playerdata';
import { MapInfoPacket } from './../networking/packets/incoming/mapinfo-packet';
import { PacketIO } from './../networking/packetio';
import { PluginManager } from './../core/plugin-manager';
import { ResourceManager } from './../core/resource-manager';
import { HookPacket } from './../decorators/hook-packet';
import { Classes } from './../models/classes';
import { GotoPacket } from './../networking/packets/incoming/goto-packet';
import { GotoAckPacket } from './../networking/packets/outgoing/gotoack-packet';
import { ReconnectPacket } from './../networking/packets/incoming/reconnect-packet';
import { AoePacket } from './../networking/packets/incoming/aoe-packet';
import { AoeAckPacket } from './../networking/packets/outgoing/aoeack-packet';
import { EnemyShootPacket } from './../networking/packets/incoming/enemy-shoot-packet';
import { ShootAckPacket } from './../networking/packets/outgoing/shootack-packet';
import { UpdateAckPacket } from './../networking/packets/outgoing/updateack-packet';
import { ServerPlayerShootPacket } from './../networking/packets/incoming/server-player-shoot-packet';
import { PlayerShootPacket } from './../networking/packets/outgoing/player-shoot-packet';
import { EventEmitter } from 'events';
import { SocksClient, SocksClientOptions } from 'socks';
import { IMapInfo } from './../models/mapinfo';
import { CLI } from '../cli';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;
const MIN_ATTACK_FREQ = 0.0015;
const MAX_ATTACK_FREQ = 0.008;
const ACCOUNT_IN_USE_REGEX = /Account in use \((\d+) seconds? until timeout\)/;

export class Client {

    /**
     * Attaches an event listener to the client.
     * @example
     * ```
     * Client.on('disconnect', (data: IPlayerData) => {
     *   delete this.clients[data.name];
     * });
     * ```
     * @param event The name of the event to listen for. Available events are 'connect'|'disconnect'
     * @param listener The callback to invoke when the event is fired.
     */
    public static on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        if (!this.emitter) {
            this.emitter = new EventEmitter();
        }
        return this.emitter.on(event, listener);
    }
    private static emitter: EventEmitter;

    /**
     * The player data of the client.
     * @see `IPlayerData` for more info.
     */
    public playerData: IPlayerData;
    /**
     * The objectId of the client.
     */
    public objectId: number;
    /**
     * The current position of the client.
     */
    public worldPos: WorldPosData;
    /**
     * The PacketIO instance associated with the client.
     * @see `PacketIO` for more info.
     */
    public packetio: PacketIO;
    /**
     * The tiles of the current map. These are stored in a
     * 1d array, so to access the tile at x, y the index
     * y * height + x should be used where height is the height
     * of the map.
     * @example
     * ```
     * public getTile(client: Client, x: number, y: number): GroundTileData {
     *   const tileX = Math.floor(x);
     *   const tileY = Math.floor(y);
     *   return client.mapTiles.mapTiles[tileY * client.mapInfo.height + tileX];
     * }
     * ```
     */
    public mapTiles: GroundTileData[];
    /**
     * The position the client will try to move towards.
     * If this is `null` then the client will not move.
     * @example
     * ```
     * const pos: WorldPosData = client.worldPos.clone();
     * pos.x += 1;
     * pos.y += 1;
     * client.nextPos = pos;
     * ```
     */
    public nextPos: WorldPosData;
    /**
     * Info about the current map including
     * @see `IMapInfo` for more information.
     */
    public mapInfo: IMapInfo;
    /**
     * Info about the account's characters.
     * @see `ICharacterInfo` for more information.
     */
    public charInfo: ICharacterInfo;
    /**
     * The server the client is connected to.
     * @see `IServer` for more info.
     */
    public server: IServer;
    /**
     * The alias of the client.
     */
    public alias: string;
    /**
     * A number between 0 and 1 which can be used to modify the speed
     * of the player. A value of 1 will be 100% move speed for the client,
     * a value of 0.5 will be 50% of the max speed. etc.
     *
     * @example
     * ```
     * client.moveMultiplier = 0.8;
     * ```
     */
    public set moveMultiplier(value: number) {
        this.internalMoveMultiplier = Math.max(0, Math.min(value, 1));
    }
    public get moveMultiplier(): number {
        return this.internalMoveMultiplier;
    }
    private internalMoveMultiplier: number;

    private nexusServerIp: string;
    private serverIp: string;
    private lastTickTime: number;
    private currentTickTime: number;
    private connectTime: number;
    private guid: string;
    private password: string;
    private buildVersion: string;
    private clientSocket: Socket;
    private proxy: IProxy;
    private currentBulletId: number;
    private lastAttackTime: number;

    // reconnect info
    private key: Int8Array;
    private keyTime: number;
    private gameId: number;
    private reconnectCooldown: number;

    // packet control
    private blockedPackets: PacketType[];

    /**
     * Creates a new instance of the client and begins the connection process to the specified server.
     * @param server The server to connect to.
     * @param buildVersion The current build version of RotMG.
     * @param accInfo The account info to connect with.
     */
    constructor(server: IServer, buildVersion: string, accInfo: IAccount) {
        if (!Client.emitter) {
            Client.emitter = new EventEmitter();
        }
        this.blockedPackets = [];
        this.key = new Int8Array(0);
        this.keyTime = -1;
        this.gameId = -2;
        this.playerData = getDefaultPlayerData();
        this.server = server;
        this.playerData.server = server.name;
        this.nextPos = null;
        this.internalMoveMultiplier = 1;
        this.currentBulletId = 0;
        this.lastAttackTime = 0;
        this.guid = accInfo.guid;
        this.password = accInfo.password;
        this.buildVersion = buildVersion;
        this.alias = accInfo.alias;
        this.proxy = accInfo.proxy;
        if (accInfo.charInfo) {
            this.charInfo = accInfo.charInfo;
        } else {
            this.charInfo = { charId: 0, nextCharId: 1, maxNumChars: 1 };
        }
        this.serverIp = server.address;
        this.nexusServerIp = server.address;
        Log(this.alias, 'Starting connection to ' + server.name, LogLevel.Info);
        this.connect();
    }

    /**
     * Shoots a projectile at the specified angle.
     * @param angle The angle in radians to shoot towards.
     */
    public shoot(angle: number): boolean {
        const time = this.getTime();
        const item = ResourceManager.items[this.playerData.inventory[0]];
        const attackPeriod = 1 / this.getAttackFrequency() * (1 / item.rateOfFire);
        if (time < this.lastAttackTime + attackPeriod) {
            return false;
        }

        this.lastAttackTime = time;
        const shootPacket = new PlayerShootPacket();
        shootPacket.bulletId = this.getBulletId();
        shootPacket.angle = angle;
        shootPacket.containerType = item.type;
        shootPacket.time = time;
        shootPacket.startingPos = this.worldPos.clone();
        this.packetio.sendPacket(shootPacket);
        return true;
    }

    /**
     * Removes all event listeners and destroys any resources held by the client.
     * This should only be used when the client is no longer needed.
     */
    public destroy(): void {
        if (this.packetio) {
            this.packetio.destroy();
        }
        if (this.clientSocket) {
            Client.emitter.emit('disconnect', Object.assign({}, this.playerData), this);
            this.clientSocket.removeAllListeners('connect');
            this.clientSocket.removeAllListeners('close');
            this.clientSocket.removeAllListeners('error');
            this.clientSocket.destroy();
        }
    }

    /**
     * Switches the client connect to a proxied connection. Setting this to
     * null will remove the current proxy if there is one.
     * @param proxy The proxy to use.
     */
    public setProxy(proxy: IProxy): void {
        if (proxy) {
            Log(this.alias, 'Connecting to new proxy.');
        } else {
            Log(this.alias, 'Connecting without proxy.');
        }
        this.proxy = proxy;
        this.connect();
    }

    /**
     * Blocks the next packet of the specified type.
     * @param packetType The packet type to block.
     */
    public blockNext(packetType: PacketType): void {
        if (this.blockedPackets.indexOf(packetType) < 0) {
            this.blockedPackets.push(packetType);
        }
    }

    /**
     * Broadcasts a packet to all connected clients except
     * the client which broadcasted the packet.
     * @param packet The packet to broadcast.
     */
    public broadcastPacket(packet: Packet): void {
        const clients = CLI.getClients();
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].alias !== this.alias) {
                clients[i].packetio.emitPacket(packet);
            }
        }
    }

    @HookPacket(PacketType.MAPINFO)
    private onMapInfo(client: Client, mapInfoPacket: MapInfoPacket): void {
        if (this.charInfo.charId > 0) {
            const loadPacket = new LoadPacket();
            loadPacket.charId = this.charInfo.charId;
            loadPacket.isFromArena = false;
            Log(this.alias, 'Connecting to ' + mapInfoPacket.name, LogLevel.Info);
            this.packetio.sendPacket(loadPacket);
        } else {
            const createPacket = new CreatePacket();
            createPacket.classType = Classes.Wizard;
            createPacket.skinType = 0;
            Log(this.alias, 'Creating new char', LogLevel.Info);
            this.packetio.sendPacket(createPacket);
        }
        this.mapTiles = new Array<GroundTileData>(mapInfoPacket.width * mapInfoPacket.height);
        this.mapInfo = { width: mapInfoPacket.width, height: mapInfoPacket.height, name: mapInfoPacket.name };
    }

    @HookPacket(PacketType.UPDATE)
    private onUpdate(client: Client, updatePacket: UpdatePacket): void {
        // reply
        const updateAck = new UpdateAckPacket();
        this.packetio.sendPacket(updateAck);

        // playerdata
        for (let i = 0; i < updatePacket.newObjects.length; i++) {
            if (updatePacket.newObjects[i].status.objectId === this.objectId) {
                this.worldPos = updatePacket.newObjects[i].status.pos;
                this.playerData = ObjectStatusData.processObject(updatePacket.newObjects[i]);
                this.playerData.server = this.server.name;
            }
        }

        // map tiles
        for (let i = 0; i < updatePacket.tiles.length; i++) {
            const tile = updatePacket.tiles[i];
            this.mapTiles[tile.y * this.mapInfo.width + tile.x] = tile;
        }
    }

    @HookPacket(PacketType.RECONNECT)
    private onReconnectPacket(client: Client, reconnectPacket: ReconnectPacket): void {
        this.serverIp = (reconnectPacket.host === '' ? this.nexusServerIp : reconnectPacket.host);
        this.gameId = reconnectPacket.gameId;
        this.key = reconnectPacket.key;
        this.keyTime = reconnectPacket.keyTime;
        this.connect();
    }

    @HookPacket(PacketType.GOTO)
    private onGotoPacket(client: Client, gotoPacket: GotoPacket): void {
        const ack = new GotoAckPacket();
        ack.time = this.getTime();
        this.packetio.sendPacket(ack);
    }

    @HookPacket(PacketType.FAILURE)
    private onFailurePacket(client: Client, failurePacket: FailurePacket): void {
        this.gameId = -2;
        this.keyTime = -1;
        this.key = new Int8Array(0);
        this.serverIp = this.nexusServerIp;
        this.clientSocket.destroy();
        Log(this.alias, 'Received failure: "' + failurePacket.errorDescription + '"', LogLevel.Error);
        const accInUse = ACCOUNT_IN_USE_REGEX.exec(failurePacket.errorDescription);
        if (accInUse) {
            const time = +accInUse[1] + 1;
            Log(this.alias, ' Received account in use error. Reconnecting in ' + time + ' seconds.', LogLevel.Warning);

        }
    }

    @HookPacket(PacketType.AOE)
    private onAoe(client: Client, aoePacket: AoePacket): void {
        const aoeAck = new AoeAckPacket();
        aoeAck.time = this.getTime();
        aoeAck.position = this.worldPos.clone();
        this.packetio.sendPacket(aoeAck);
    }

    @HookPacket(PacketType.NEWTICK)
    private onNewTick(client: Client, newTickPacket: NewTickPacket): void {
        this.lastTickTime = this.currentTickTime;
        this.currentTickTime = this.getTime();
        // reply
        const movePacket = new MovePacket();
        movePacket.tickId = newTickPacket.tickId;
        movePacket.time = this.getTime();
        if (this.nextPos) {
            this.moveTo(this.nextPos);
        }
        movePacket.newPosition = this.worldPos;
        movePacket.records = [];
        this.packetio.sendPacket(movePacket);

        for (let i = 0; i < newTickPacket.statuses.length; i++) {
            const status = newTickPacket.statuses[i];
            if (status.objectId === this.objectId) {
                this.playerData = ObjectStatusData.processStatData(status.stats, this.playerData);
                this.playerData.objectId = this.objectId;
                this.playerData.worldPos = this.worldPos;
                this.playerData.server = this.server.name;
                break;
            }
        }
    }

    @HookPacket(PacketType.PING)
    private onPing(client: Client, pingPacket: PingPacket): void {
        // reply
        const pongPacket = new PongPacket();
        pongPacket.serial = pingPacket.serial;
        pongPacket.time = this.getTime();
        this.packetio.sendPacket(pongPacket);
    }

    @HookPacket(PacketType.ENEMYSHOOT)
    private onEnemyShoot(client: Client, enemyShootPacket: EnemyShootPacket): void {
        const shootAck = new ShootAckPacket();
        shootAck.time = this.getTime();
        this.packetio.sendPacket(shootAck);
    }

    @HookPacket(PacketType.SERVERPLAYERSHOOT)
    private onServerPlayerShoot(client: Client, serverPlayerShoot: ServerPlayerShootPacket): void {
        if (serverPlayerShoot.ownerId === this.objectId) {
            const ack = new ShootAckPacket();
            ack.time = this.getTime();
            this.packetio.sendPacket(ack);
        }
    }

    @HookPacket(PacketType.CREATESUCCESS)
    private onCreateSuccess(client: Client, createSuccessPacket: CreateSuccessPacket): void {
        this.objectId = createSuccessPacket.objectId;
        this.charInfo.charId = createSuccessPacket.charId;
        this.charInfo.nextCharId = this.charInfo.charId + 1;
        Log(this.alias, 'Connected!', LogLevel.Success);
    }

    private getTime(): number {
        return (Date.now() - this.connectTime);
    }

    private onConnect(): void {
        Client.emitter.emit('connect', Object.assign({}, this.playerData), this);
        Log(this.alias, 'Connected to ' + this.server.name + '!', LogLevel.Success);
        this.connectTime = Date.now();
        this.lastTickTime = 0;
        this.currentTickTime = 0;
        this.sendHello();
    }

    private sendHello(): void {
        const hp: HelloPacket = new HelloPacket();
        hp.buildVersion = this.buildVersion;
        hp.gameId = this.gameId;
        hp.guid = this.guid;
        hp.password = this.password;
        hp.random1 = Math.floor(Math.random() * 1000000000);
        hp.random2 = Math.floor(Math.random() * 1000000000);
        hp.secret = '';
        hp.keyTime = this.keyTime;
        hp.key = this.key;
        hp.mapJSON = '';
        hp.entryTag = '';
        hp.gameNet = '';
        hp.gameNet = 'rotmg';
        hp.gameNetUserId = '';
        hp.playPlatform = 'rotmg';
        hp.platformToken = '';
        hp.userToken = '';
        this.packetio.sendPacket(hp);
    }

    private getBulletId(): number {
        const bId = this.currentBulletId;
        this.currentBulletId = (this.currentBulletId + 1) % 128;
        return bId;
    }

    private onClose(error: boolean): void {
        Client.emitter.emit('disconnect', Object.assign({}, this.playerData), this);
        Log(this.alias, 'The connection to ' + this.server.name + ' was closed.', LogLevel.Warning);
        let reconnectTime = 5;
        if (this.reconnectCooldown) {
            reconnectTime = this.reconnectCooldown;
            this.reconnectCooldown = null;
        }
        Log(this.alias, 'Reconnecting in ' + reconnectTime + ' seconds');
        setTimeout(() => {
            this.connect();
        }, reconnectTime * 1000);
        // process.exit(0);
    }

    private onError(error: Error): void {
        Log(this.alias, 'Received socket error: ' + error, LogLevel.Error);
    }

    private connect(): void {
        if (this.clientSocket) {
            this.clientSocket.removeAllListeners('connect');
            this.clientSocket.removeAllListeners('close');
            this.clientSocket.removeAllListeners('error');
            this.clientSocket.destroy();
        }

        if (this.proxy) {
            Log(this.alias, 'Establishing proxy', LogLevel.Info);
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
                    host: this.serverIp,
                    port: 2050
                }
            }).then((info) => {
                Log(this.alias, 'Established proxy!', LogLevel.Success);
                this.clientSocket = info.socket;
                this.initSocket(false);
            }).catch((error) => {
                Log(this.alias, 'Error establishing proxy', LogLevel.Error);
                Log(this.alias, error, LogLevel.Error);
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
        if (!this.packetio) {
            this.packetio = new PacketIO(this.clientSocket);
            this.packetio.on('packet', (data: Packet) => {
                const index = this.blockedPackets.indexOf(data.type);
                if (index > -1) {
                    this.blockedPackets = this.blockedPackets.filter((p) => p !== data.type);
                } else {
                    PluginManager.callHooks(data.type, data, this);
                }
            });
            this.packetio.on('error', (err) => {
                Log(this.alias, 'Received PacketIO error: ' + err, LogLevel.Error);
                this.clientSocket.destroy();
            });
        } else {
            this.packetio.reset(this.clientSocket);
        }
        if (connect) {
            this.clientSocket.connect(2050, this.serverIp);
        } else {
            this.onConnect();
        }
        this.clientSocket.on('connect', this.onConnect.bind(this));
        this.clientSocket.on('close', this.onClose.bind(this));
        this.clientSocket.on('error', this.onError.bind(this));
    }

    private moveTo(target: WorldPosData): void {
        const step = this.getSpeed();
        if (this.worldPos.squareDistanceTo(target) > step ** 2) {
            const angle: number = Math.atan2(target.y - this.worldPos.y, target.x - this.worldPos.x);
            this.worldPos.x += Math.cos(angle) * step;
            this.worldPos.y += Math.sin(angle) * step;
        } else {
            this.worldPos.x = target.x;
            this.worldPos.y = target.y;
            this.nextPos = null;
        }
    }

    private getSpeed(): number {
        const speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);
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

        return (speed * multiplier * tickTime * this.internalMoveMultiplier);
    }

    private getAttackFrequency(): number {
        return MIN_ATTACK_FREQ + this.playerData.dex / 75 * (MAX_ATTACK_FREQ - MIN_ATTACK_FREQ);
    }
}
