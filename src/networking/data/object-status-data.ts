import { Packet } from './../packet';
import { WorldPosData } from './world-pos-data';
import { StatData } from './stat-data';
import { IPlayerData, getDefaultPlayerData } from './../../models/playerdata';
import { ObjectData } from './object-data';

export class ObjectStatusData {

    static processObject(data: ObjectData): IPlayerData {
        const playerData = this.processObjectStatus(data.status);
        playerData.class = data.objectType;
        return playerData;
    }

    static processObjectStatus(data: ObjectStatusData, currentData?: IPlayerData): IPlayerData {
        const playerData = this.processStatData(data.stats, currentData);
        playerData.worldPos = data.pos;
        playerData.objectId = data.objectId;

        return playerData;
    }

    static processStatData(data: StatData[], currentData?: IPlayerData): IPlayerData {
        const playerData = currentData || getDefaultPlayerData();
        for (const stat of data) {
            switch (stat.statType) {
                case StatData.NAME_STAT:
                    playerData.name = stat.stringStatValue;
                    continue;
                case StatData.LEVEL_STAT:
                    playerData.level = stat.statValue;
                    continue;
                case StatData.EXP_STAT:
                    playerData.exp = stat.statValue;
                    continue;
                case StatData.CURR_FAME_STAT:
                    playerData.currentFame = stat.statValue;
                    continue;
                case StatData.NUM_STARS_STAT:
                    playerData.stars = stat.statValue;
                    continue;
                case StatData.ACCOUNT_ID_STAT:
                    playerData.accountId = stat.stringStatValue;
                    continue;
                case StatData.FAME_STAT:
                    playerData.accountFame = stat.statValue;
                    continue;
                case StatData.CREDITS_STAT:
                    playerData.gold = stat.statValue;
                    continue;
                case StatData.MAX_HP_STAT:
                    playerData.maxHP = stat.statValue;
                    continue;
                case StatData.MAX_MP_STAT:
                    playerData.maxMP = stat.statValue;
                    continue;
                case StatData.HP_STAT:
                    playerData.hp = stat.statValue;
                    continue;
                case StatData.MP_STAT:
                    playerData.mp = stat.statValue;
                    continue;
                case StatData.ATTACK_STAT:
                    playerData.atk = stat.statValue;
                    continue;
                case StatData.DEFENSE_STAT:
                    playerData.def = stat.statValue;
                    continue;
                case StatData.SPEED_STAT:
                    playerData.spd = stat.statValue;
                    continue;
                case StatData.DEXTERITY_STAT:
                    playerData.dex = stat.statValue;
                    continue;
                case StatData.VITALITY_STAT:
                    playerData.vit = stat.statValue;
                    continue;
                case StatData.CONDITION_STAT:
                    playerData.condition = stat.statValue;
                    continue;
                case StatData.WISDOM_STAT:
                    playerData.wis = stat.statValue;
                    continue;
                case StatData.HEALTH_POTION_STACK_STAT:
                    playerData.hpPots = stat.statValue;
                    continue;
                case StatData.MAGIC_POTION_STACK_STAT:
                    playerData.mpPots = stat.statValue;
                    continue;
                case StatData.HASBACKPACK_STAT:
                    playerData.hasBackpack = stat.statValue === 1;
                    continue;
                case StatData.NAME_CHOSEN_STAT:
                    playerData.nameChosen = stat.statValue !== 0;
                    continue;
                case StatData.GUILD_NAME_STAT:
                    playerData.guildName = stat.stringStatValue;
                    continue;
                case StatData.GUILD_RANK_STAT:
                    playerData.guildRank = stat.statValue;
                    continue;
                default:
                    if (stat.statType >= StatData.INVENTORY_0_STAT && stat.statType <= StatData.INVENTORY_11_STAT) {
                        playerData.inventory[stat.statType - 8] = stat.statValue;
                    } else if (stat.statType >= StatData.BACKPACK_0_STAT && stat.statType <= StatData.BACKPACK_7_STAT) {
                        playerData.inventory[stat.statType - 59] = stat.statValue;
                    }
            }
        }
        return playerData;
    }

    objectId: number;
    pos: WorldPosData;
    stats: StatData[];

    read(packet: Packet): void {
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

    write(packet: Packet): void {
        packet.writeInt32(this.objectId);
        this.pos.write(packet);
        packet.writeShort(this.stats.length);
        for (const stat of this.stats) {
            stat.write(packet);
        }
    }
}
