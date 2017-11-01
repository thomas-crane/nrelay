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
import { StatData } from './../networking/data/stat-data';
import { ObjectStatusData } from './../networking/data/object-status-data';
import { IPlayerData, getDefaultPlayerData } from './../models/playerdata';
import { PacketIO } from './../networking/packetio';
import { PluginManager } from './../core/plugin-manager';
import { HookPacket } from './../decorators/hook-packet';

export class Client {

    public objectId: number;
    public worldPos: WorldPosData;
    public playerData: IPlayerData;

    private serverIp: string;
    private packetio: PacketIO;
    private lastTickTime: number;
    private connectTime: number;
    private guid: string;
    private password: string;
    private buildVersion: string;

    constructor(server: string, accInfo?: IAccountInfo) {
        this.playerData = getDefaultPlayerData();
        if (accInfo) {
            this.playerData.charId = accInfo.charId;
            this.playerData.nextCharId = accInfo.nextCharId;
            this.playerData.maxNumChars = accInfo.maxNumChars;
            this.guid = accInfo.guid;
            this.password = accInfo.password;
            this.buildVersion = accInfo.buildVersion;
        }
        this.serverIp = server;
        const clientSocket = new net.Socket({
            readable: true,
            writable: true
        });
        this.packetio = new PacketIO(clientSocket);
        Log('Client', 'Starting connection.', SeverityLevel.Info);
        clientSocket.connect(2050, this.serverIp);
        clientSocket.on('connect', this.onConnect.bind(this));
        clientSocket.on('close', this.onClose);

        this.packetio.on('packet', (data: Packet) => {
            PluginManager.callHooks(data.type, data, this);
        });
    }

    @HookPacket(PacketType.MapInfo)
    onMapInfo(client: Client, packet: Packet): void {
        const loadPacket = Packets.create(PacketType.Load) as LoadPacket;
        loadPacket.charId = this.playerData.charId;
        loadPacket.isFromArena = false;
        client.packetio.sendPacket(loadPacket);
    }

    @HookPacket(PacketType.Update)
    onUpdate(client: Client, packet: Packet): void {
        const updatePacket = packet as UpdatePacket;
        // reply
        const updateAck = Packets.create(PacketType.UpdateAck);
        client.packetio.sendPacket(updateAck);

        for (let i = 0; i < updatePacket.newObjects.length; i++) {
            if (updatePacket.newObjects[i].status.objectId === this.objectId) {
                this.processStatData(updatePacket.newObjects[i].status);
            }
        }
    }

    @HookPacket(PacketType.Failure)
    onFailurePacket(client: Client, packet: Packet): void {
        const failurePacket = packet as FailurePacket;
        Log('Client', 'Received failure: "' + failurePacket.errorDescription + '"', SeverityLevel.Error);
    }

    @HookPacket(PacketType.NewTick)
    onNewTick(client: Client, packet: Packet): void {
        const newTickPacket = packet as NewTickPacket;
        // reply
        const movePacket = Packets.create(PacketType.Move) as MovePacket;
        movePacket.tickId = newTickPacket.tickId;
        movePacket.time = client.getTime();
        movePacket.newPosition = client.worldPos;
        movePacket.records = [];
        client.packetio.sendPacket(movePacket);
    }

    @HookPacket(PacketType.Ping)
    onPing(client: Client, packet: Packet): void {
        const pingPacket = packet as PingPacket;
        // reply
        const pongPacket = Packets.create(PacketType.Pong) as PongPacket;
        pongPacket.serial = pingPacket.serial;
        pongPacket.time = client.getTime();
        client.packetio.sendPacket(pongPacket);
    }

    @HookPacket(PacketType.CreateSuccess)
    onCreateSuccess(client: Client, packet: Packet): void {
        const createSuccessPacket = packet as CreateSuccessPacket;
        this.objectId = createSuccessPacket.objectId;
    }

    getTime(): number {
        return (Date.now() - this.connectTime);
    }

    onConnect(): void {
        Log('Client', 'Connected to server!', SeverityLevel.Success);
        this.connectTime = Date.now();
        const hp: HelloPacket = new HelloPacket();
        hp.buildVersion = this.buildVersion;
        hp.gameId = -2;
        hp.guid = this.guid;
        hp.password = this.password;
        hp.random1 = Math.floor(Math.random() * 1000000000);
        hp.random2 = Math.floor(Math.random() * 1000000000);
        hp.secret = '';
        hp.keyTime = -1;
        hp.key = new Int8Array(0);
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

    onClose(error: boolean): void {
        Log('Client', 'The connection was closed.', SeverityLevel.Warning);
        if (error) {
            Log('Client', 'An error occurred (cause of close)', SeverityLevel.Error);
        }
        process.exit(0);
    }

    moveTo(target: WorldPosData): WorldPosData {
        return target;
    }

    processStatData(data: ObjectStatusData): void {
        this.worldPos = data.pos;
        for (let i = 0; i < data.stats.length; i++) {
            switch (data.stats[i].statType) {
                case StatData.NAME_STAT:
                    this.playerData.name = data.stats[i].stringStatValue;
                    continue;
                case StatData.LEVEL_STAT:
                    this.playerData.level = data.stats[i].statValue;
                    continue;
                case StatData.EXP_STAT:
                    this.playerData.exp = data.stats[i].statValue;
                    continue;
                case StatData.CURR_FAME_STAT:
                    this.playerData.currentFame = data.stats[i].statValue;
                    continue;
                case StatData.MAX_HP_STAT:
                    this.playerData.maxHP = data.stats[i].statValue;
                    continue;
                case StatData.MAX_MP_STAT:
                    this.playerData.maxMP = data.stats[i].statValue;
                    continue;
                case StatData.HP_STAT:
                    this.playerData.hp = data.stats[i].statValue;
                    continue;
                case StatData.MP_STAT:
                    this.playerData.mp = data.stats[i].statValue;
                    continue;
                case StatData.ATTACK_STAT:
                    this.playerData.atk = data.stats[i].statValue;
                    continue;
                case StatData.DEFENSE_STAT:
                    this.playerData.def = data.stats[i].statValue;
                    continue;
                case StatData.SPEED_STAT:
                    this.playerData.spd = data.stats[i].statValue;
                    continue;
                case StatData.DEXTERITY_STAT:
                    this.playerData.dex = data.stats[i].statValue;
                    continue;
                case StatData.VITALITY_STAT:
                    this.playerData.vit = data.stats[i].statValue;
                    continue;
                case StatData.WISDOM_STAT:
                    this.playerData.wis = data.stats[i].statValue;
                    continue;
                case StatData.HEALTH_POTION_STACK_STAT:
                    this.playerData.hpPots = data.stats[i].statValue;
                    continue;
                case StatData.MAGIC_POTION_STACK_STAT:
                    this.playerData.mpPots = data.stats[i].statValue;
                    continue;
                case StatData.HASBACKPACK_STAT:
                    this.playerData.hasBackpack = data.stats[i].statValue === 1;
                    continue;
                default:
                    if (data.stats[i].statType >= StatData.INVENTORY_0_STAT && data.stats[i].statType <= StatData.INVENTORY_11_STAT) {
                        this.playerData.inventory[data.stats[i].statType - 8] = data.stats[i].statValue;
                    } else if (data.stats[i].statType >= StatData.BACKPACK_0_STAT && data.stats[i].statType >= StatData.BACKPACK_7_STAT) {
                        this.playerData.inventory[data.stats[i].statType - 71] = data.stats[i].statValue;
                    }
            }
        }
    }
}
