import net = require('net');
import { Log, SeverityLevel } from '../services/logger';
import { Packet, PacketType } from './../networking/packet';
import { IAccountInfo } from './../models/accinfo';
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
import { WorldPosData } from './../networking/data/world-pos-data';
import { GroundTileData } from './../networking/data/ground-tile-data';
import { StatData } from './../networking/data/stat-data';
import { ObjectStatusData } from './../networking/data/object-status-data';
import { IPlayerData, getDefaultPlayerData } from './../models/playerdata';
import { MapInfoPacket } from './../networking/packets/incoming/mapinfo-packet';
import { PacketIO } from './../networking/packetio';
import { PluginManager } from './../core/plugin-manager';
import { HookPacket } from './../decorators/hook-packet';

const MIN_MOVE_SPEED = 0.004;
const MAX_MOVE_SPEED = 0.0096;

export class Client {

    public playerData: IPlayerData;
    public packetio: PacketIO;
    public mapTiles: GroundTileData[];
    public nextPos: WorldPosData;

    private serverIp: string;
    private lastTickTime: number;
    private connectTime: number;
    private guid: string;
    private password: string;
    private buildVersion: string;
    private clientSocket: net.Socket;
    private moveMultiplier: number;
    private mapInfo: { width: number, height: number, name: string };

    constructor(server: string, accInfo?: IAccountInfo) {
        this.playerData = getDefaultPlayerData();
        this.nextPos = null;
        if (accInfo) {
            this.playerData.charId = accInfo.charId;
            this.playerData.nextCharId = accInfo.nextCharId;
            this.playerData.maxNumChars = accInfo.maxNumChars;
            this.guid = accInfo.guid;
            this.password = accInfo.password;
            this.buildVersion = accInfo.buildVersion;
        }
        this.serverIp = server;
        Log('Client', 'Starting connection.', SeverityLevel.Info);
        this.connect();
    }

    @HookPacket(PacketType.MapInfo)
    private onMapInfo(client: Client, mapInfoPacket: MapInfoPacket): void {
        const loadPacket = Packets.create(PacketType.Load) as LoadPacket;
        loadPacket.charId = this.playerData.charId;
        loadPacket.isFromArena = false;
        Log('Client', 'Connecting to ' + mapInfoPacket.name, SeverityLevel.Info);
        client.packetio.sendPacket(loadPacket);
        this.mapTiles = new Array<GroundTileData>(mapInfoPacket.width * mapInfoPacket.height);
        this.mapInfo = { width: mapInfoPacket.width, height: mapInfoPacket.height, name: mapInfoPacket.name };
    }

    @HookPacket(PacketType.Update)
    private onUpdate(client: Client, updatePacket: UpdatePacket): void {
        // reply
        const updateAck = Packets.create(PacketType.UpdateAck);
        client.packetio.sendPacket(updateAck);

        // playerdata
        for (let i = 0; i < updatePacket.newObjects.length; i++) {
            if (updatePacket.newObjects[i].status.objectId === this.playerData.objectId) {
                this.playerData = ObjectStatusData.processStatData(updatePacket.newObjects[i].status);
            }
        }

        // map tiles
        for (let i = 0; i < updatePacket.tiles.length; i++) {
            const tile = updatePacket.tiles[i];
            this.mapTiles[tile.y * this.mapInfo.width + tile.x] = tile;
        }
    }

    @HookPacket(PacketType.Failure)
    private onFailurePacket(client: Client, failurePacket: FailurePacket): void {
        this.clientSocket.end();
        Log('Client', 'Received failure: "' + failurePacket.errorDescription + '"', SeverityLevel.Error);
    }

    @HookPacket(PacketType.NewTick)
    private onNewTick(client: Client, newTickPacket: NewTickPacket): void {
        this.lastTickTime = newTickPacket.tickTime;
        // reply
        const movePacket = Packets.create(PacketType.Move) as MovePacket;
        movePacket.tickId = newTickPacket.tickId;
        movePacket.time = client.getTime();
        movePacket.newPosition = client.playerData.worldPos;
        if (this.nextPos) {
            movePacket.newPosition = this.moveTo(this.nextPos, true);
        }
        movePacket.records = [];
        client.packetio.sendPacket(movePacket);

        for (let i = 0; i < newTickPacket.statuses.length; i++) {
            if (newTickPacket.statuses[i].objectId === this.playerData.objectId) {
                this.playerData.worldPos = newTickPacket.statuses[i].pos;
            }
        }
    }

    @HookPacket(PacketType.Ping)
    private onPing(client: Client, pingPacket: PingPacket): void {
        // reply
        const pongPacket = Packets.create(PacketType.Pong) as PongPacket;
        pongPacket.serial = pingPacket.serial;
        pongPacket.time = client.getTime();
        client.packetio.sendPacket(pongPacket);
    }

    @HookPacket(PacketType.CreateSuccess)
    private onCreateSuccess(client: Client, createSuccessPacket: CreateSuccessPacket): void {
        this.playerData.objectId = createSuccessPacket.objectId;
        Log('Client', 'Connected!', SeverityLevel.Success);
    }

    private getTime(): number {
        return (Date.now() - this.connectTime);
    }

    private onConnect(): void {
        Log('Client', 'Connected to server!', SeverityLevel.Success);
        this.connectTime = Date.now();
        this.sendHello(-2, -1, new Int8Array(0));
    }

    private sendHello(gameId: number, keyTime: number, key: Int8Array): void {
        const hp: HelloPacket = new HelloPacket();
        hp.buildVersion = this.buildVersion;
        hp.gameId = gameId;
        hp.guid = this.guid;
        hp.password = this.password;
        hp.random1 = Math.floor(Math.random() * 1000000000);
        hp.random2 = Math.floor(Math.random() * 1000000000);
        hp.secret = '';
        hp.keyTime = keyTime;
        hp.key = key;
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
        Log('Client', 'The connection was closed.', SeverityLevel.Warning);
        if (error) {
            Log('Client', 'An error occurred (cause of close)', SeverityLevel.Error);
        }
        Log('Client', 'Reconnecting in 5 seconds');
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

        this.clientSocket = new net.Socket({
            readable: true,
            writable: true
        });
        if (!this.packetio) {
            this.packetio = new PacketIO(this.clientSocket);
            this.packetio.on('packet', (data: Packet) => {
                PluginManager.callHooks(data.type, data, this);
            });
        } else {
            this.packetio.reset(this.clientSocket);
        }
        this.clientSocket.connect(2050, this.serverIp);
        this.clientSocket.on('connect', this.onConnect.bind(this));
        this.clientSocket.on('close', this.onClose.bind(this));
    }

    private moveTo(target: WorldPosData, reset: boolean): WorldPosData {
        let newPos = new WorldPosData();
        const step = this.getSpeed();
        if (this.squareDistanceTo(target) > step) {
            const angle: number = Math.atan2(target.y - this.playerData.worldPos.y, target.x - this.playerData.worldPos.x);
            newPos.x = this.playerData.worldPos.x + Math.cos(angle) * step;
            newPos.y = this.playerData.worldPos.y + Math.sin(angle) * step;
        } else {
            newPos = target;
            if (reset) {
                this.nextPos = null;
            }
        }
        return newPos;
    }

    private squareDistanceTo(location: WorldPosData): number {
        const a = location.x - this.playerData.worldPos.x;
        const b = location.y - this.playerData.worldPos.y;
        return a ** 2 + b ** 2;
    }

    private getSpeed(): number {
        // let speed = MIN_MOVE_SPEED + this.playerData.spd / 75 * (MAX_MOVE_SPEED - MIN_MOVE_SPEED);
        // speed *= this.moveMultiplier;
        const speed = (4.0 + 5.6 * (this.playerData.spd / 75.0)) / 5.0;
        return speed;
    }
}
