import { Packet } from './../packet';
import { WorldPosData } from './world-pos-data';
import { StatData } from './stat-data';
import { IPlayerData, getDefaultPlayerData } from './../../models/playerdata';

export class ObjectStatusData {

    public static processObjectStatus(data: ObjectStatusData): IPlayerData {
        const playerData = this.processStatData(data.stats);
        playerData.worldPos = data.pos;
        playerData.objectId = data.objectId;

        return playerData;
    }

    public static processStatData(data: StatData[], currentData?: IPlayerData): IPlayerData {
        const playerData = currentData || getDefaultPlayerData();
        for (let i = 0; i < data.length; i++) {
            switch (data[i].statType) {
                case StatData.NAME_STAT:
                    playerData.name = data[i].stringStatValue;
                    continue;
                case StatData.LEVEL_STAT:
                    playerData.level = data[i].statValue;
                    continue;
                case StatData.EXP_STAT:
                    playerData.exp = data[i].statValue;
                    continue;
                case StatData.CURR_FAME_STAT:
                    playerData.currentFame = data[i].statValue;
                    continue;
                case StatData.MAX_HP_STAT:
                    playerData.maxHP = data[i].statValue;
                    continue;
                case StatData.MAX_MP_STAT:
                    playerData.maxMP = data[i].statValue;
                    continue;
                case StatData.HP_STAT:
                    playerData.hp = data[i].statValue;
                    continue;
                case StatData.MP_STAT:
                    playerData.mp = data[i].statValue;
                    continue;
                case StatData.ATTACK_STAT:
                    playerData.atk = data[i].statValue;
                    continue;
                case StatData.DEFENSE_STAT:
                    playerData.def = data[i].statValue;
                    continue;
                case StatData.SPEED_STAT:
                    playerData.spd = data[i].statValue;
                    continue;
                case StatData.DEXTERITY_STAT:
                    playerData.dex = data[i].statValue;
                    continue;
                case StatData.VITALITY_STAT:
                    playerData.vit = data[i].statValue;
                    continue;
                case StatData.WISDOM_STAT:
                    playerData.wis = data[i].statValue;
                    continue;
                case StatData.HEALTH_POTION_STACK_STAT:
                    playerData.hpPots = data[i].statValue;
                    continue;
                case StatData.MAGIC_POTION_STACK_STAT:
                    playerData.mpPots = data[i].statValue;
                    continue;
                case StatData.HASBACKPACK_STAT:
                    playerData.hasBackpack = data[i].statValue === 1;
                    continue;
                default:
                    if (data[i].statType >= StatData.INVENTORY_0_STAT && data[i].statType <= StatData.INVENTORY_11_STAT) {
                        playerData.inventory[data[i].statType - 8] = data[i].statValue;
                    } else if (data[i].statType >= StatData.BACKPACK_0_STAT && data[i].statType <= StatData.BACKPACK_7_STAT) {
                        playerData.inventory[data[i].statType - 59] = data[i].statValue;
                    }
            }
        }
        return playerData;
    }

    objectId: number;
    pos: WorldPosData;
    stats: StatData[];

    public read(packet: Packet): void {
        this.objectId = packet.readInt32();
        this.pos = new WorldPosData();
        this.pos.read(packet);
        const statLen = packet.readShort();
        this.stats = new Array(statLen);
        for (let i = 0; i < statLen; i++) {
            const sd = new StatData();
            sd.read(packet);
            this.stats[i] = sd;
        }
    }

    public write(packet: Packet): void {
        packet.writeInt32(this.objectId);
        this.pos.write(packet);
        packet.writeShort(this.stats.length);
        for (let i = 0; i < this.stats.length; i++) {
            this.stats[i].write(packet);
        }
    }
}
