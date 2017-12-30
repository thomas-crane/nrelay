import { Socket } from 'net';
import { Log, LogLevel } from '../services/logger';
import { Packet, PacketType } from './../networking/packet';
import { IAccountInfo, IAccount } from './../models/accinfo';
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
import { EventEmitter } from 'events';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;
const EMAIL_REPLACE_REGEX = /.+?(.+?)(?:@|\+\d+).+?(.+?)\./;

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
     * pos: WorldPosData = new WorldPosData();
     * pos.x = client.playerData.worldPos.x + 1;
     * pos.y = client.playerData.worldPos.y + 1;
     * client.nextPos = pos;
     */
    public nextPos: WorldPosData;
    /**
     * Info about the current map including
     *  + `width: number` the width of the map.
     *  + `height: number` the height of the name.
     *  + `name: string` the name of the map.
     */
    public mapInfo: { width: number, height: number, name: string };
    /**
     * Info about the account's characters including
     *  + `charId: number` the last selected character's id.
     *  + `nextCharId: number` the next character id that the account will receive.
     *  + `maxNumChars: number` the number of character slots available.
     */
    public charInfo: { charId: number, nextCharId: number, maxNumChars: number };

    private nexusServerIp: string;
    private serverIp: string;
    private lastTickTime: number;
    private currentTickTime: number;
    private connectTime: number;
    private guid: string;
    private censoredGuid: string;
    private password: string;
    private buildVersion: string;
    private clientSocket: Socket;
    private moveMultiplier: number;

    // reconnect info
    private key: Int8Array;
    private keyTime: number;
    private gameId: number;

    /**
     * Creates a new instance of the client and begins the connection process to the specified server.
     * @param server The server to connect to.
     * @param buildVersion The current build version of RotMG.
     * @param accInfo The account info to connect with.
     */
    constructor(server: IServer, buildVersion: string, accInfo?: IAccount) {
        if (!Client.emitter) {
            Client.emitter = new EventEmitter();
        }
        this.key = new Int8Array(0);
        this.keyTime = -1;
        this.gameId = -2;
        this.playerData = getDefaultPlayerData();
        this.playerData.server = server.name;
        this.nextPos = null;
        if (accInfo) {
            this.charInfo = accInfo;
            this.guid = accInfo.guid;
            const match = EMAIL_REPLACE_REGEX.exec(this.guid);
            if (match) {
                if (match[1]) {
                    this.censoredGuid = this.guid.replace(match[1], '***');
                }
                if (match[2]) {
                    this.censoredGuid = this.censoredGuid.replace(match[2], '***');
                }
            }
            this.password = accInfo.password;
            this.buildVersion = buildVersion;
        } else {
            this.charInfo = { charId: 0, nextCharId: 1, maxNumChars: 1 };
        }
        this.serverIp = server.address;
        this.nexusServerIp = server.address;
        Log('Client', 'Starting connection to ' + server.name, LogLevel.Info);
        this.connect();
    }

    @HookPacket(PacketType.MAPINFO)
    private onMapInfo(client: Client, mapInfoPacket: MapInfoPacket): void {
        if (this.charInfo.charId > 0) {
            const loadPacket = new LoadPacket();
            loadPacket.charId = this.charInfo.charId;
            loadPacket.isFromArena = false;
            Log(this.censoredGuid, 'Connecting to ' + mapInfoPacket.name, LogLevel.Info);
            client.packetio.sendPacket(loadPacket);
        } else {
            const createPacket = new CreatePacket();
            createPacket.classType = Classes.Wizard;
            createPacket.skinType = 0;
            Log(this.censoredGuid, 'Creating new char', LogLevel.Info);
            client.packetio.sendPacket(createPacket);
        }
        this.mapTiles = new Array<GroundTileData>(mapInfoPacket.width * mapInfoPacket.height);
        this.mapInfo = { width: mapInfoPacket.width, height: mapInfoPacket.height, name: mapInfoPacket.name };
    }

    @HookPacket(PacketType.UPDATE)
    private onUpdate(client: Client, updatePacket: UpdatePacket): void {
        // reply
        const updateAck = new UpdateAckPacket();
        client.packetio.sendPacket(updateAck);

        // playerdata
        for (let i = 0; i < updatePacket.newObjects.length; i++) {
            if (updatePacket.newObjects[i].status.objectId === this.playerData.objectId) {
                const server = this.playerData.server;
                this.playerData = ObjectStatusData.processStatData(updatePacket.newObjects[i].status);
                this.playerData.server = server;
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
        this.serverIp = reconnectPacket.host;
        this.gameId = reconnectPacket.gameId;
        this.key = reconnectPacket.key;
        this.keyTime = reconnectPacket.keyTime;
        this.connect();
    }

    @HookPacket(PacketType.GOTO)
    private onGotoPacket(client: Client, gotoPacket: GotoPacket): void {
        const ack = new GotoAckPacket();
        ack.time = this.getTime();
        client.packetio.sendPacket(ack);
    }

    @HookPacket(PacketType.FAILURE)
    private onFailurePacket(client: Client, failurePacket: FailurePacket): void {
        this.playerData = getDefaultPlayerData();
        this.gameId = -2;
        this.keyTime = -1;
        this.key = new Int8Array(0);
        this.serverIp = this.nexusServerIp;
        this.clientSocket.end();
        Log(this.censoredGuid, 'Received failure: "' + failurePacket.errorDescription + '"', LogLevel.Error);
    }

    @HookPacket(PacketType.AOE)
    private onAoe(client: Client, aoePacket: AoePacket): void {
        const aoeAck = new AoeAckPacket();
        aoeAck.time = this.getTime();
        aoeAck.position = new WorldPosData();
        aoeAck.position.x = this.playerData.worldPos.x;
        aoeAck.position.y = this.playerData.worldPos.y;
        this.packetio.sendPacket(aoeAck);
    }

    @HookPacket(PacketType.NEWTICK)
    private onNewTick(client: Client, newTickPacket: NewTickPacket): void {
        this.lastTickTime = this.currentTickTime;
        this.currentTickTime = this.getTime();
        // reply
        const movePacket = new MovePacket();
        movePacket.tickId = newTickPacket.tickId;
        movePacket.time = client.getTime();
        if (this.nextPos) {
            this.moveTo(this.nextPos);
        }
        movePacket.newPosition = client.playerData.worldPos;
        movePacket.records = [];
        client.packetio.sendPacket(movePacket);
    }

    @HookPacket(PacketType.PING)
    private onPing(client: Client, pingPacket: PingPacket): void {
        // reply
        const pongPacket = new PongPacket();
        pongPacket.serial = pingPacket.serial;
        pongPacket.time = client.getTime();
        client.packetio.sendPacket(pongPacket);
    }

    @HookPacket(PacketType.ENEMYSHOOT)
    private onEnemyShoot(client: Client, enemyShootPacket: EnemyShootPacket): void {
        const shootAck = new ShootAckPacket();
        shootAck.time = this.getTime();
        this.packetio.sendPacket(shootAck);
    }

    @HookPacket(PacketType.CREATESUCCESS)
    private onCreateSuccess(client: Client, createSuccessPacket: CreateSuccessPacket): void {
        this.playerData.objectId = createSuccessPacket.objectId;
        this.charInfo.charId = createSuccessPacket.charId;
        this.charInfo.nextCharId = this.charInfo.charId + 1;
        Log(this.censoredGuid, 'Connected!', LogLevel.Success);
    }

    private getTime(): number {
        return (Date.now() - this.connectTime);
    }

    private onConnect(): void {
        Client.emitter.emit('connect', Object.assign({}, this.playerData));
        Log(this.censoredGuid, 'Connected to server!', LogLevel.Success);
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

    private onClose(error: boolean): void {
        Client.emitter.emit('disconnect', Object.assign({}, this.playerData));
        Log(this.censoredGuid, 'The connection was closed.', LogLevel.Warning);
        if (error) {
            Log(this.censoredGuid, 'An error occurred (cause of close)', LogLevel.Error);
        }
        Log(this.censoredGuid, 'Reconnecting in 5 seconds');
        setTimeout(() => {
            this.connect();
        }, 5000);
        // process.exit(0);
    }

    private connect(): void {
        if (this.clientSocket) {
            this.clientSocket.removeAllListeners('connect');
            this.clientSocket.removeAllListeners('close');
            this.clientSocket.end();
        }

        this.clientSocket = new Socket({
            readable: true,
            writable: true
        });
        if (!this.packetio) {
            this.packetio = new PacketIO(this.clientSocket);
            this.packetio.on('packet', (data: Packet) => {
                PluginManager.callHooks(data.type, data, this);
            });
            this.packetio.on('error', () => {
                Log(this.censoredGuid, 'Received PacketIO error. Reconnecting.');
                this.clientSocket.destroy();
            });
        } else {
            this.packetio.reset(this.clientSocket);
        }
        this.clientSocket.connect(2050, this.serverIp);
        this.clientSocket.on('connect', this.onConnect.bind(this));
        this.clientSocket.on('close', this.onClose.bind(this));
    }

    private moveTo(target: WorldPosData): void {
        const newPos = new WorldPosData();
        const step = this.getSpeed();
        if (this.playerData.worldPos.squareDistanceTo(target) > step ** 2) {
            const angle: number = Math.atan2(target.y - this.playerData.worldPos.y, target.x - this.playerData.worldPos.x);
            this.playerData.worldPos.x += Math.cos(angle) * step;
            this.playerData.worldPos.y += Math.sin(angle) * step;
        } else {
            this.playerData.worldPos.x = target.x;
            this.playerData.worldPos.y = target.y;
            this.nextPos = null;
        }
    }

    private getSpeed(): number {
        const speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);
        const x = Math.floor(this.playerData.worldPos.x);
        const y = Math.floor(this.playerData.worldPos.y);
        let multiplier = 1;

        if (this.mapTiles[y * this.mapInfo.width + x] && ResourceManager.tiles[this.mapTiles[y * this.mapInfo.width + x].type]) {
            multiplier = ResourceManager.tiles[this.mapTiles[y * this.mapInfo.width + x].type].speed;
        }
        let tickTime = this.currentTickTime - this.lastTickTime;

        if (tickTime > 200) {
            tickTime = 200;
        }

        return (speed * multiplier * tickTime);
    }
}
